import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

export const documentClient = DynamoDBDocument.from(new DynamoDBClient());
