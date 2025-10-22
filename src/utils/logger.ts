export const info = (msg: string, meta?: any) => {
  console.info(new Date().toISOString(), 'INFO', msg, meta || '');
};

export const warn = (msg: string, meta?: any) => {
  console.warn(new Date().toISOString(), 'WARN', msg, meta || '');
};

export const error = (msg: string, meta?: any) => {
  console.error(new Date().toISOString(), 'ERROR', msg, meta || '');
};

export default { info, warn, error };