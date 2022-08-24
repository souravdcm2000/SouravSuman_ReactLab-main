import { Routes, Route } from "react-router-dom";
import ExpenseTracker from "./components/ExpenseTracker";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {return (
    <div>
      <Routes>
        <Route path="/" element={<ExpenseTracker />} />
      </Routes>
    </div>
  );
}

export default App;
