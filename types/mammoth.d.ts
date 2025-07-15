declare module 'mammoth' {
  export function convertToPlainText(options: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string }>;
}
