import ImageKit from 'imagekit';
import { env } from './env';

const imageKit = new ImageKit({
  publicKey: env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGE_KIT_ENDPOINT,
});

export default imageKit;