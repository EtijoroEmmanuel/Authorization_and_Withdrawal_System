
export interface IENVIRONMENT {
   APP: {
      NAME: string;
      PORT: number;
      ENV: string;
      CLIENT?: string;
    };

     DB: {
      URL: string;
    };
    AUTH:{
      JWT_SECRET: string,
      JWT_EXPIRES:number,
      BCRYPT_SALT_ROUNDS:number
    };
   REDIS_URL:string;
}

export interface ExtendedError extends Error {
    statusCode?: number;
    errors?: any;
}