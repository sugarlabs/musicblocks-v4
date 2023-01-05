import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import {App} from './index';

// Define the Container constant inside the Splash component
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
`;

const ProgressBar = styled.div`
  width: 80%;
  height: 20px;
  background-color: #ddd;
  border-radius: 10px;
  margin: 20px 0;
`;

const Progress = styled.div`
  width: 50%;
  height: 100%;
  background-color: #333;
  border-radius: 10px;
`;

interface Props {
  progress: number;
}

export function unmountSplashAndRenderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    //ReactDOM.unmountComponentAtNode(rootElement);
    ReactDOM.render(<App />, document.getElementById('root'));
  }
  
}

const Splash: React.FC<Props> = ({ progress }) => {
   

  return (
    // Add an id attribute to the container element
    <Container id="splash">
      <Logo src="/logo.png" alt="Logo" />
      <ProgressBar>
        <Progress style={{ width: `${progress}%` }} />
      </ProgressBar>
    </Container>
  );
};

export default Splash;
