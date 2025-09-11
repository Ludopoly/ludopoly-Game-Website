export interface IIPFSService {
  upload(file: File): Promise<string>;
}

export class PinataIPFSService implements IIPFSService {
  async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return `https://ipfs.io/ipfs/${data.hash}`;
  }
}

// Varsayılan export eski fonksiyonun uyumluluğu için
export const uploadToPinataViaBackend = async (file: File): Promise<string> => {
  return new PinataIPFSService().upload(file);
}

// Static helper method for URL resolution
export const resolveIPFSUrl = (cid: string): string => {
  const cleanCID = cid.replace(/^ipfs:\/\//, '').replace(/^https?:\/\/.*\//, '')
  return `https://ipfs.io/ipfs/${cleanCID}`
}
