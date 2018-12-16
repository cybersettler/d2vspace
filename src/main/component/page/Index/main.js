import {PageElement} from '/node_modules/weldkit/index.js';
import MouseControls from '/frontend/component/mousecontrols.js';
import LoopHandler from '/frontend/component/LoopHandler.js';
import KeyboardControls from '/frontend/assets/js/KeyboardControls.js';

const world = {
  'name': 'Home',
  'description': 'Test Home Site',
  'baseURL': '/frontend/',
  'subject': {
    'defaultPosition': [0, 0, 0],
  },
  'environment': {
    'ground': {
      'body': 'terrain',
      'position': [0, 0, 0],
      'rotation': [1.57, 0, 0],
    },
    'sky': false,
    'gravityVector': [0, -10, 0]
  },
  'content': [
    {
      'component': 'AmbientLight1',
      'instances': [
        {'position': [0, 10, 0], 'rotation': [0, 0, 0]},
      ],
    }, {
      'component': 'brickBlock',
      'instances': [
        {'position': [0, 0.3, -3], 'rotation': [0, 0, 0]},
        {'position': [0.6, 0.3, -3], 'rotation': [0, 0, 0]},
      ],
    }, {
      'component': 'sandstoneSlab',
      'instances': [],
    }, {
      'component': 'redBall',
      'instances': [
        {
          'position': [0, 5, -3], 'rotation': [0, 0, 0],
          'mass': 1,
        },
      ],
    },
  ],
  'geometries': [
    {
      'type': 'PlaneBufferGeometry',
      'name': 'terrainGeometry',
      'width': 10000,
      'depth': 10000,
    }, {
      'type': 'BoxGeometry',
      'name': 'wallBlockGeometry',
      'width': 0.6,
      'height': 0.6,
      'depth': 0.3,
      'widthSegments': 1,
      'heightSegments': 1,
      'depthSegments': 1,
    }, {
      'name': 'slabGeometry',
      'type': 'BoxGeometry',
      'width': 0.6,
      'height': 0.3,
      'depth': 0.6,
      'widthSegments': 1,
      'heightSegments': 1,
      'depthSegments': 1,
    }, {
      'name': 'blockGeometry',
      'type': 'BoxGeometry',
      'width': 0.6,
      'height': 0.6,
      'depth': 0.6,
      'widthSegments': 1,
      'heightSegments': 1,
      'depthSegments': 1,
    }, {
      'name': 'ballGeometry',
      'type': 'SphereGeometry',
      'radius': 0.15,
      'widthSegments': 32,
      'heightSegments': 16,
      'phiStart': 0,
      'phiLength': 6.28,
      'thetaStart': 0,
      'thetaLength': 3.14,
    },
  ],
  'textures': [
    {
      'name': 'mushroomTexture',
      'imageURL': 'assets/images/textures/mushroom_block_skin_stem.png',
      'mapping': 'UVMapping',
    }, {
      'name': 'brickTexture',
      'imageURL': 'assets/images/textures/brick.png',
      'mapping': 'UVMapping',
    }, {
      'name': 'sandstoneTexture',
      'imageURL': 'assets/images/textures/sandstone_smooth.png',
      'mapping': 'UVMapping',
    },
  ],
  'materials': [
    {
      'name': 'sandMaterial',
      'type': 'MeshPhongMaterial',
      'color': 0xffffff,
      'specular': 0x050505,
      'hsl': [0.095, 1, 0.75],
    }, {
      'type': 'MeshLambertMaterial',
      'name': 'floorMaterial',
      'color': 11119017,
      'ambient': 11119017,
      'emissive': 0,
      'vertexColors': 1,
    }, {
      'type': 'MeshLambertMaterial',
      'name': 'brickMaterial',
      'color': 16777215,
      'ambient': 16777215,
      'emissive': 0,
      'texture': 'brickTexture',
    }, {
      'type': 'MeshLambertMaterial',
      'name': 'sandstoneMaterial',
      'color': 16777215,
      'ambient': 16777215,
      'emissive': 0,
      'texture': 'sandstoneTexture',
    }, {
      'name': 'redLambertMaterial',
      'type': 'MeshLambertMaterial',
      'color': 16721408,
      'emissive': 0,
    },
  ],
  'bodies': [
    {
      'type': 'Mesh',
      'name': 'terrain',
      'geometryName': 'terrainGeometry',
      'materialName': 'sandMaterial',
      'receiveShadow': true,
    }, {
      'type': 'AmbientLight',
      'name': 'AmbientLight1',
      'color': 16777215,
      'matrix': [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        99.58999633789062,
        0,
        1],
    }, {
      'type': 'Mesh',
      'name': 'brickBlock',
      'geometryName': 'blockGeometry',
      'materialName': 'brickMaterial',
      'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    }, {
      'type': 'Mesh',
      'name': 'sandstoneBlock',
      'geometryName': 'blockGeometry',
      'materialName': 'sandstoneMaterial',
      'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    }, {
      'type': 'Mesh',
      'name': 'sandstoneSlab',
      'geometryName': 'slabGeometry',
      'materialName': 'sandstoneMaterial',
      'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    }, {
      'type': 'Mesh',
      'name': 'redBall',
      'geometryName': 'ballGeometry',
      'materialName': 'redLambertMaterial',
      'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    },
  ],
  'components': [
    {
      'name': 'AmbientLight1',
      'body': 'AmbientLight1',
      'componentType': 'illumination',
    }, {
      'name': 'brickBlock',
      'body': 'brickBlock',
      'componentType': 'buildingBlock',
      'thumbnailURL': 'site/assets/images/thumb/brick.png',
    }, {
      'name': 'sandstoneBlock',
      'body': 'sandstoneBlock',
      'componentType': 'buildingBlock',
      'thumbnailURL': 'site/assets/images/thumb/sandstone_smooth.png',
    }, {
      'name': 'sandstoneSlab',
      'body': 'sandstoneSlab',
      'componentType': 'buildingBlock',
      'thumbnailURL': 'site/assets/images/thumb/sandstone_smooth.png',
    }, {
      'name': 'redBall',
      'body': 'redBall',
      'componentType': 'freeBody',
      'thumbnailURL': 'site/assets/images/thumb/red_ball.png',
    },
  ],
};

class IndexElement extends PageElement {

  constructor() {
    super();
    /*
    this.scope.sendGetRequest('/textures').then(function(result) {
      console.log('received textures', result);
    }); */
  }

  connectedCallback() {
    let element = this;
    let keyboardControls = new KeyboardControls();
    let perspective;
    this.scope.appendViewFromTemplate(
        '/frontend/component/page/Index/view.html')
        .then((template) => {
          console.log('Template imported', template.id);
          let mouseControls = new MouseControls(element);
          perspective = element.querySelector('ui-p3d');

      return new Promise(function(fulfill) {
        perspective.addEventListener('initialized', function(event) {
          fulfill(event.detail);
        });
      });
    })
    .then(function(result) {
      let loop = new LoopHandler({
        perspective: perspective,
        world: result,
      });
      element.onMouseMouse = function(data) {
        loop.handleMouseMove(data);
      };

      keyboardControls.addDownEventHandler('w', function() {
        loop.handleMoveForward();
      });

      loop.animate();
    });
  }

  getScene() {
    return world;
  }
}

customElements.define('page-index', IndexElement);

export default IndexElement;
