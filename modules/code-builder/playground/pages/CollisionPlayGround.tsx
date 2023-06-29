import QuadTree from '@/collision/quadtree';
import { useEffect } from 'react';

const positionGenerator = (): { x: number; y: number } => {
  return {
    x: Math.floor(Math.random() * window.innerWidth),
    y: Math.floor(Math.random() * window.innerHeight),
  };
};

class CollisionPlayGround {
  private position: { x: number; y: number }[] = [];
  private divs: HTMLDivElement[] = [];

  constructor() {
    this.generatePosition();
    this.generateDivs();
  }

  public generatePosition() {
    for (let i = 0; i < 20; i++) {
      this.position.push(positionGenerator());
    }
  }

  public getPosition(): { x: number; y: number }[] {
    return this.position;
  }

  public generateDivs(): HTMLDivElement[] {
    this.divs = this.position.map((pos) => {
      const div = document.createElement('div');
      div.style.position = 'fixed';
      div.style.zIndex = '100';
      div.id = `draggable${pos.x}${pos.y}`;
      div.classList.add('draggableDiv');
      div.draggable = true;
      div.style.left = `${pos.x}px`;
      div.style.top = `${pos.y}px`;
      div.style.width = '20px';
      div.style.height = '20px';
      div.style.borderRadius = '50%';
      div.style.backgroundColor = 'black';
      return div;
    });
    return this.divs;
  }

  public getDivsObject(): { x: number; y: number; ID: string }[] {
    const obj = this.divs.map((div) => {
      return {
        x: parseInt(div.style.left),
        y: parseInt(div.style.top),
        ID: div.id,
      };
    });
    return obj;
  }

  public getMainDiv(): string {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    this.divs.forEach((d) => {
      div.appendChild(d);
    });
    return div.innerHTML;
  }
}

export default function (): JSX.Element {
  const collisionPlayGround = new CollisionPlayGround();
  const quadTree = new QuadTree();
  quadTree.setDimensions(window.innerWidth, window.innerHeight);
  quadTree.init();
  quadTree.addObjects(collisionPlayGround.getDivsObject());
  quadTree.setOptions({ type: 'circle', radius: 20, collisionProperties: 'distance' });

  const handleCollision = (e) => {
    const blocks = quadTree.checkCollision({ x: e.clientX, y: e.clientY, ID: e.target.id });
    console.log(blocks);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleCollision);
    return () => {
      document.addEventListener('mousemove', handleCollision);
    };
  });
  return <div dangerouslySetInnerHTML={{ __html: collisionPlayGround.getMainDiv() }}></div>;
}
