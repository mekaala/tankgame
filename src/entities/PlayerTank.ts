import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManger from "../utils/ResourceManager";

class PlayerTank extends GameEntity {
    constructor(position:Vector3){
        super(position);
    }

    public load = async () => {
        const tankModel = ResourceManger.instance.getModel("tank");
        if(!tankModel) {
            throw "unable to get tank model";
        }

        const tankBodyMesh = tankModel.scene.children.find(
            (m) => m.name === "Body"
        ) as Mesh;

        const tankTurretMesh = tankModel.scene.children.find(
            (m) => m.name === "Turret"
        ) as Mesh;

        const tankBodyTexture = ResourceManger.instance.getTexture("tank-body");
        const tankTurretTexture = ResourceManger.instance.getTexture("tank-turret");

        if (!tankBodyMesh || !tankTurretMesh || !tankBodyTexture || !tankTurretTexture) {
            throw "unable to load player model or textures";
        }

        const bodyMaterial = new MeshStandardMaterial({
            map: tankBodyTexture
        })
        const turretMaterial = new MeshStandardMaterial({
            map: tankTurretTexture
        })

        tankBodyMesh.material = bodyMaterial;
        tankTurretMesh.material = turretMaterial;

        this._mesh.add(tankBodyMesh);
        this._mesh.add(tankTurretMesh);

    }
}

export default PlayerTank;