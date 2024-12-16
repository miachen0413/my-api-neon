import {
  Pool,
  neonConfig
} from "@neondatabase/serverless";

const client = new Pool({
  connectionString: 'postgresql://neondb_owner:pJ9EFKnv5Zsy@ep-icy-bird-a459klel.us-east-1.aws.neon.tech/neondb?sslmode=require', // 從 Neon Dashboard 取得
});

export {
  neonConfig,
  client,
}