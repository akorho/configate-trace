interface DatabaseConfig {
  host: string;
  port: number;
  password?: string;
}

interface Config {
  database: DatabaseConfig;
}

const config: Config = {
  database: {
    host: 'localhost',
    port: 5432,
    password: 'secret'
  }
};

export default config; 