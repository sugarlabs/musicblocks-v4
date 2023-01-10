import React from 'react';
import styled from 'styled-components';

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

const Splash: React.FC<Props> = ({ progress }) => {
    return (
        <Container id="splash">
            <Logo src="/logo.png" alt="Logo" />
            <ProgressBar>
                <Progress style={{ width: `${progress}%` }} />
            </ProgressBar>
        </Container>
    );
};

export default Splash;
