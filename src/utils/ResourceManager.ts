import { Texture, TextureLoader } from "three";

class ResourceManger {
    private static _instance = new ResourceManger();
    public static get instance() {
        return this._instance
    }
    private constructor() {

    }

    private _groundTextures: Texture[] = [];

    public load = async () => {
        // create assets for game        
        const textureLoader = new TextureLoader();
        await this.loadGroundTextures(textureLoader);
    }

    private loadGroundTextures =async (textureLoader: TextureLoader) => {
        const groundTextureFiles = [
            "g1.png",
            "g2.png",
            "g3.png",
            "g4.png",
            "g5.png",
            "g6.png",
            "g7.png",
            "g8.png"
        ]

        for (let index = 0; index < groundTextureFiles.length; index++) {
            const element = groundTextureFiles[index];
            const texture = await textureLoader.loadAsync(`textures/${element}`);
            this._groundTextures.push(texture); 
        }
    }
    
    public getRandomGroundTexture = () => {
        return this._groundTextures[
            Math.floor(Math.random() * this._groundTextures.length)
        ]
    }
}

export default ResourceManger;