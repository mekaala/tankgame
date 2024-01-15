import { Box3, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManger from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";
import Bullet from "./Bullet";
import ShootEffect from "../effects/ShootEffect";

type KeyboardState = {
    LeftPressed: boolean;
    RightPressed: boolean;
    UpPressed: boolean;
    DownPressed: boolean;
}

class PlayerTank extends GameEntity {
    private _rotation: number = 0;

    private _keyboardState: KeyboardState = {
        LeftPressed: false,
        RightPressed: false,
        UpPressed: false,
        DownPressed: false
    }

    constructor(position:Vector3){
        super(position, "player");
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp)
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case "ArrowUp":
                this._keyboardState.UpPressed = true;
                break;
            case "ArrowDown":
                this._keyboardState.DownPressed = true;
                break;
            case "ArrowLeft":
                this._keyboardState.LeftPressed = true;
                break;
            case "ArrowRight":
                this._keyboardState.RightPressed = true;
                break;   
            default:
                break;
        }   
    }

    private handleKeyUp = async (e:KeyboardEvent) => {
        switch (e.key) {
            case "ArrowUp":
                this._keyboardState.UpPressed = false;
                break;
            case "ArrowDown":
                this._keyboardState.DownPressed = false;
                break;
            case "ArrowLeft":
                this._keyboardState.LeftPressed = false;
                break;
            case "ArrowRight":
                this._keyboardState.RightPressed = false;
                break;
            case " ":
                await this.shoot();
                break;
            default:
                break;
        }
    }

    private shoot = async () => {
        const offset = new Vector3(
            Math.sin(this._rotation) * 0.45,
            -Math.cos(this._rotation) * 0.45,
            0.5
        );
        const shootingPosition = this._mesh.position.clone().add(offset);

        const bullet = new Bullet  (shootingPosition, this._rotation);
        await bullet.load();

        const shootEffect = new ShootEffect(shootingPosition, this._rotation);
        await shootEffect.load();

        GameScene.instance.addToScene(shootEffect);
        GameScene.instance.addToScene(bullet);
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

        const collider = new Box3()
        .setFromObject(this._mesh)
        .getBoundingSphere(new Sphere(this._mesh.position.clone()));

        collider.radius *= 0.75;
        this._collider = collider;

    }

    public update = (deltaT: number) => {
        let computedRotation = this._rotation;
        let computedMovement = new Vector3();
        const moveSpeed = 2;

        if (this._keyboardState.LeftPressed) {
            computedRotation += Math.PI * deltaT;
        } else if (this._keyboardState.RightPressed) {
            computedRotation -= Math.PI * deltaT;
        }

        const fullCircle = Math.PI * 2;
        if (computedRotation > fullCircle) {
            computedRotation = fullCircle - computedRotation;
        } else if (computedRotation < 0) {
            computedRotation = fullCircle  + computedRotation;
        }

        const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
        const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);
        if (this._keyboardState.UpPressed) {
            computedMovement = new Vector3(xMovement, -yMovement, 0);
        } else if (this._keyboardState.DownPressed) {
            computedMovement = new Vector3(-xMovement, yMovement, 0)
        }

        this._rotation = computedRotation;
        this._mesh.setRotationFromAxisAngle(new Vector3(0,0,1), computedRotation)


        const testingSphere = this._collider?.clone() as Sphere;
        testingSphere.center.add(computedMovement);

        const colliders = GameScene.instance.gameEntities.filter(
            (e) => 
                e !== this &&
                e.entityType !== "bullet" &&
                e.collider &&
                e.collider!.intersectsSphere(testingSphere)
        )

        if (colliders.length) {
            return;
        }

        this._mesh.position.add(computedMovement);
        (this._collider as Sphere).center.add(computedMovement);

        GameScene.instance.camera.position.set(
            this._mesh.position.x,
            this._mesh.position.y,
            GameScene.instance.camera.position.z
        );
    }
}

export default PlayerTank;