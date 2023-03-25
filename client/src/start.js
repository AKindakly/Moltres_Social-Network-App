// import ReactDOM from "react-dom";
import ReactDOM from "react-dom/client";

import Welcome from "./components/welcome/Welcome";
import App from "./components/app/App";

import rootReducer from "./redux/root.reducer";
import { Provider } from "react-redux";
import { initSocket } from "./socket";
import { createStore } from "redux";

const store = createStore(rootReducer);
const root = ReactDOM.createRoot(document.querySelector("main"));

fetch("/user/id")
    .then((response) => response.json())
    .then((data) => {
        if (!data.userId) {
            // this means that the user doens't have a userId and should see Welcome/Registration for now
            // ReactDOM.render(<Welcome />, document.querySelector("main"));
            root.render(<Welcome />);
        } else {
            // this means the user is registered cause their browser DID have the right cookie and they should be seeing a logo
            initSocket(store);
            // ReactDOM.render(
            //     <Provider store={store}>
            //         <App />
            //     </Provider>,
            //     document.querySelector("main")
            // );
            root.render(
                <Provider store={store}>
                    <App />
                </Provider>
            );
        }
    });
