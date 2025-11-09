import * as THREE from "three";

export class Audience {
  constructor(scene) {
    this.scene = scene;
    this.audienceGroup = new THREE.Group();
    this._buildAudience();
    this.scene.add(this.audienceGroup);
  }

  _buildAudience() {
    const colors = [0x8b4513, 0xd2691e, 0xdaa520, 0xff8c00, 0xffa500];
    const positions = [
      { x: -8, y: -3, z: 5 },
      { x: -6, y: -3, z: 6 },
      { x: -4, y: -3.5, z: 7 },
      { x: 4, y: -3.5, z: 7 },
      { x: 6, y: -3, z: 6 },
      { x: 8, y: -3, z: 5 },
    ];

    positions.forEach((pos, i) => {
      const person = this._createPerson(colors[i % colors.length]);
      person.position.set(pos.x, pos.y, pos.z);
      person.lookAt(0, 0, 0);
      this.audienceGroup.add(person);
    });
  }

  _createPerson(color) {
    const group = new THREE.Group();

    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.4, 0.8, 8);

    const material = new THREE.MeshLambertMaterial({
      color: color,
      emissive: new THREE.Color(color).multiplyScalar(0.2),
    });

    const head = new THREE.Mesh(headGeometry, material);
    head.position.y = 0.9;

    const body = new THREE.Mesh(bodyGeometry, material);
    body.position.y = 0.3;

    group.add(head);
    group.add(body);

    return group;
  }

  animate(time) {
    this.audienceGroup.children.forEach((person, index) => {
      const offset = index * 0.5;
      const sway = Math.sin(time * 0.5 + offset) * 0.05;
      person.rotation.z = sway;
    });
  }
}
