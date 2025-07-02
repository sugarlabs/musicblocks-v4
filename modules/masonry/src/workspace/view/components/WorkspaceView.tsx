import React from 'react';
import type WorkspaceManager from '../../model/model';
import TowerView from '../../../tower/view/components/TowerView';

const WorkspaceView: React.FC<{ manager: WorkspaceManager }> = ({ manager }) => (
  <svg width={2000} height={1200} style={{ border: '1px solid #aaa', background: '#f9f9f9' }}>
    {manager.allTowers.map((tower) => (
      <TowerView key={tower.id} tower={tower} />
    ))}
  </svg>
);
export default WorkspaceView;
