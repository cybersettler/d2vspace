import {PageElement} from '/node_modules/weldkit/index.js';
import LoopHandler from '/frontend/component/LoopHandler.js';

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
          'mass': 1, 'restitution': 0.5
        },
      ],
    },
  ]
};

class IndexElement extends PageElement {

  constructor() {
    super();
  }

  connectedCallback() {
    let element = this;
    let perspective, loop;
    document.querySelector('web-app')
    .setAttribute('style', 'padding: 0');
    let promises = ['components', 'bodies', 'materials', 'geometries', 'textures']
      .map(collectionName => {
        let request = new Request('/catalog/' + collectionName);
        return fetch(request)
          .then(response => response.json())
          .then(result => world[collectionName] = result)
      });
    Promise.all(promises)
      .then(() => element.scope.appendViewFromTemplate(
          '/frontend/component/page/Index/view.html'))
      .then((template) => {
          console.log('Template imported', template.id);
          perspective = element.querySelector('ui-p3d');

          return new Promise(function(fulfill) {
            perspective.addEventListener('initialized', function(event) {
              fulfill(event.detail);
            });
          });
        })
        .then(function(result) {
          loop = new LoopHandler({
            perspective: perspective,
            world: result,
          });

          loop.start();
          let modal = document.querySelector('ui-modal');
          modal.dispatchEvent(new Event('openDialog'));
        });
      }

      getScene() {
        return world;
      }

      onEnterSpace() {
        document.querySelector('ui-p3d')
          .requestPointerLock();
      }
    }

customElements.define('page-index', IndexElement);

export default IndexElement;
