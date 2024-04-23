import './index.css';
import { mainModule } from './mainModule';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Landing() {

    useEffect(() => {
        mainModule();
    }, []);

    return (
        <div className = "landing">
            <Link to={"/login"}>
                <button className="login-button">LOGIN</button>
            </Link>

            <div className="text-container">
                <div className="title">
                    Sandra Davis
                    <br />
                    Siddarth Sajeev
                </div>
            </div>

            <div className="headline-container">
                <div id="text-behind">cipher<br />hide</div>
                <div id="text-behind-blur">cipher<br />hide</div>
                <div id="text-front">cipher<br />hide</div>
            </div>

            <div className="canvas-container">
                <canvas id="canvas"></canvas>
            </div>

        </div>

    );
}

export default Landing;
