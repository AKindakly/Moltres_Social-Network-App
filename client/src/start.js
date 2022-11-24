import ReactDOM from "react-dom";
import Welcome from "./components/welcome/Welcome.jsx";
import App from "./components/app/App.jsx";

import rootReducer from "./redux/root.reducer.js";
import { Provider } from "react-redux";
import { initSocket } from "./socket.js";
import { createStore } from "redux";

const store = createStore(rootReducer);

fetch("/user/id")
    .then((response) => response.json())
    .then((data) => {
        if (!data.userId) {
            // this means that the user doens't have a userId and should see Welcome/Registration for now
            ReactDOM.render(<Welcome />, document.querySelector("main"));
        } else {
            // this means the user is registered cause their browser DID have the right cookie and they should be seeing a logo
            initSocket(store);
            ReactDOM.render(
                <Provider store={store}>
                    <App />
                </Provider>,
                document.querySelector("main")
            );
        }
    });
