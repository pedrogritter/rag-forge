"use server";

import {
  type NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/server/db/schema/resources";
import { generateEmbeddings } from "../ai/embedding";

import { db } from "@/server/db";
import { embeddings } from "@/server/db/schema";
import { nanoid } from "../utils";
import { sql } from "drizzle-orm";

export const createResource = async (input: NewResourceParams) => {
  try {
    // Validate input
    const { content } = insertResourceSchema.parse(input);

    // Create the resource
    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    if (!resource?.id) {
      console.error("Failed to create resource: No ID retrurned from DB");
      return "Error creating resource. Please try again.";
    }

    console.log(`Resource created sucessfully with ID: ${resource.id}`);

    try {
      // Generate embedding for the resource content
      const generatedEmbeddings = await generateEmbeddings(content);

      if (!generatedEmbeddings || generatedEmbeddings.length === 0) {
        console.warn(`No embeddings generated for resource: ${resource.id}`);
      }

      // Insert embeddings for this resource
      let insertedCount = 0;
      for (const { content, embedding } of generatedEmbeddings) {
        try {
          const formattedEmbedding = `[${embedding.join(",")}]`;
          console.log(`Formatted embedding: ${formattedEmbedding}`);

          await db.insert(embeddings).values({
            id: nanoid(),
            resourceId: resource.id,
            content,
            embedding: sql`${formattedEmbedding}::vector`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          insertedCount++;
        } catch (error) {
          console.error(
            `Error insertinig embedding for chunk: "${content.substring(0, 25)}..."`,
          ),
            error;
        }
      }

      console.log(
        `Sucessfully inserted ${insertedCount}/${generatedEmbeddings.length} embeddings`,
      );
      return {
        resourceId: resource.id,
        sucess: true,
        embeddingsCount: insertedCount,
      };
    } catch (embeddingError) {
      console.log("Error Generating Embedding:", embeddingError);
      return "Resource created but error generating embedding";
    }
  } catch (createResourceError) {
    console.error("Error in createResource:", createResourceError);
    if (createResourceError instanceof Error) {
      return createResourceError.message.length > 0
        ? createResourceError.message
        : "Error, please try again.";
    }
    return "Unknown error ocurred.";
  }
};
