import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import routes from './routes';
import ReactDOM from 'react-dom/client';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
          <Routes>
            {routes.map((route) => (
              <Route path={route.path} element={route.element} key={route.path} />
            ))}
          </Routes>
        </BrowserRouter>
  </React.StrictMode>
);
