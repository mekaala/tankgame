import { Clock, HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import GameEntity from "../entities/GameEntity";
import GameMap from "../map/GameMap";
import ResourceManger from "../utils/ResourceManager";
import PlayerTank from "../entities/PlayerTank";
import Wall from "../map/Wall";
import EnemyTank from "../entities/EnemyTank";

class GameScene {
    private static _instance = new GameScene();
    public static get instance() {
        return this._instance;
    }
    private _width: number;
    private _height: number;
    private _renderer: WebGLRenderer;
    private _camera: PerspectiveCamera;

    private readonly _scene = new Scene();

    private _gameEntities:GameEntity[] = [];

    private _clock: Clock = new Clock()

    private _mapSize = 15;

    public get camera() {
        return this._camera;
    }

    public get gameEntities() {
        return this._gameEntities;
    }

    private constructor() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;

        this._renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
        })
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(this._width, this._height);

        const targetElement = document.querySelector<HTMLDivElement>("#app");
        if (!targetElement) {
            throw "unable to retrieve target element"
        }
        targetElement.appendChild(this._renderer.domElement)

        const aspectRatio = this._width / this._height;
        this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
        this._camera.position.set(7, 7, 15);

        window.addEventListener("resize", this.resize, false);

        const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize);
        this._gameEntities.push(gameMap);

        const playerTank = new PlayerTank(new Vector3(7, 7, 0));
        this._gameEntities.push(playerTank);

        const enemyTank1 = new EnemyTank(new Vector3((Math.random() * 7) + 1, 3, 0));
        this._gameEntities.push(enemyTank1);

        const enemyTank2 = new EnemyTank(new Vector3(3, (Math.random() * 7) + 1, 0));
        this._gameEntities.push(enemyTank2);
        console.log(enemyTank2);

        this.createWalls();
    }

    private createWalls = () => {
        const edge = this._mapSize - 1;
        this._gameEntities.push(new Wall(new Vector3(0, 0, 0)));
        this._gameEntities.push(new Wall(new Vector3(edge, 0, 0)));
        this._gameEntities.push(new Wall(new Vector3(edge, edge, 0)));
        this._gameEntities.push(new Wall(new Vector3(0, edge, 0)));

        for (let i = 1; i < edge; i++) {
            this._gameEntities.push(new Wall(new Vector3(i, 0, 0)));
            this._gameEntities.push(new Wall(new Vector3(0, i, 0)));
            this._gameEntities.push(new Wall(new Vector3(edge, i, 0)));
            this._gameEntities.push(new Wall(new Vector3(i, edge, 0)));
        }
    }

    private resize = () => {
        this._width = window.innerWidth;
        this._height = window.innerHeight;
        this._renderer.setSize(this._width, this._height);
        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
    }


    public load = async () => {

        await ResourceManger.instance.load();

        for (let index = 0; index < this._gameEntities.length; index++) {
            const element = this._gameEntities[index];
            await element.load();
            this._scene.add(element.mesh)
        }

        const light = new HemisphereLight(0xffffbb, 0x000020, 1);
        this._scene.add(light);
    }

    public render = () => {
        requestAnimationFrame(this.render);

        this.disposedEntities();

        const deltaT = this._clock.getDelta();

        for (let index = 0; index < this._gameEntities.length; index++) {
            const element = this._gameEntities[index];
            element.update(deltaT);
        }
        this._renderer.render(this._scene, this._camera);
    }

    public addToScene = (entity:GameEntity) => {
        this._gameEntities.push(entity);
        this._scene.add(entity.mesh);
    }

    // remove entities
    private disposedEntities = () => {
        const entitiesToBeDisposed = this._gameEntities.filter(
            (e) => e.shouldDispose
        );
        entitiesToBeDisposed.forEach(element => {
            this._scene.remove(element.mesh);
            element.dispose();
        })

        this._gameEntities = [...this._gameEntities.filter((e) => !e.shouldDispose),
        ];
    }
}

export default GameScene;