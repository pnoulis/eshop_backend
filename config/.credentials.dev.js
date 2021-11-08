import Hash from "#lib/misc/uuid.js";

export default {
  secretKey: Hash.generateUuid() + Math.random(3040).toString(),
  mongo: {
    connectionString: "mongodb+srv://pavlos:noulis@pavlos-noulis.pt6dm.gcp.mongodb.net/user-auth?retryWrites=true&w=majority"
  },
  redis: {
    url: "redis-10147.c14.us-east-1-2.ec2.cloud.redislabs.com",
    password: "RbGkfgTr7NM4ZTRRDytzudppSn0uzYgI",
    port: "10147"
  },
  authProviders: {
    facebook: {
      appId: "740692673294058",
      appSecret: "78ea4da186e406828d3f7fa95107c6dc",
    }
  },
  stripe: {
    publishableKey: "pk_test_51IG0iBIcyuDodgYRXCmyC1skZfnYRssCUNAxz1PEVQyJEzVFiTyAhLdP16FORg3dEUUkCAic5d709z1L7drVGerc00masx1HRd",
    secretKey: "sk_test_51IG0iBIcyuDodgYRntE3pSNuA9TiD4CCKWqgZ2PT7YKUuHkGDUz85cjbCZmMk9G1fjSmBeSLyE1ez5ILlUrBPLHa00Zs8pLOKS",
  },
};
