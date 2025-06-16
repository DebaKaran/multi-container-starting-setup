import React, { useState, useEffect } from "react";

import GoalInput from "./components/goals/GoalInput";
import CourseGoals from "./components/goals/CourseGoals";
import ErrorAlert from "./components/UI/ErrorAlert";

//1: The backend is running on port 8070.

//2: By default, the browser assumes port 80 for HTTP requests (or 443 for HTTPS).

function App() {
  const [loadedGoals, setLoadedGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(function () {
    async function fetchData() {
      setIsLoading(true);

      try {
        /**
         * 
         * Common Error: net::ERR_NAME_NOT_RESOLVED
         * In the frontend code, we reference goals-backend (the backend container name) as the API host. However, this does not work in the browser, because the browser runs outside the Docker network and has no knowledge of container names like goals-backend.

         *  In the frontend container, the only process running is the development server that serves the React application. When you access the app via localhost:3000 in your browser, any API call made to http://goals-backend:8070 fails because the browser tries to resolve goals-backend as a public DNS name, which doesn’t exist — hence the error:

         * Failed to load resource: net::ERR_NAME_NOT_RESOLVED
         */

        const response = await fetch("http://localhost:8070/goals");

        const resData = await response.json();

        if (!response.ok) {
          throw new Error(resData.message || "Fetching the goals failed.");
        }

        setLoadedGoals(resData.goals);
      } catch (err) {
        setError(
          err.message ||
            "Fetching goals failed - the server responsed with an error."
        );
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  async function addGoalHandler(goalText) {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8070/goals", {
        method: "POST",
        body: JSON.stringify({
          text: goalText,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Adding the goal failed.");
      }

      setLoadedGoals((prevGoals) => {
        const updatedGoals = [
          {
            id: resData.goal.id,
            text: goalText,
          },
          ...prevGoals,
        ];
        return updatedGoals;
      });
    } catch (err) {
      setError(
        err.message ||
          "Adding a goal failed - the server responsed with an error."
      );
    }
    setIsLoading(false);
  }

  async function deleteGoalHandler(goalId) {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8070/goals/" + goalId, {
        method: "DELETE",
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Deleting the goal failed.");
      }

      setLoadedGoals((prevGoals) => {
        const updatedGoals = prevGoals.filter((goal) => goal.id !== goalId);
        return updatedGoals;
      });
    } catch (err) {
      setError(
        err.message ||
          "Deleting the goal failed - the server responsed with an error."
      );
    }
    setIsLoading(false);
  }

  return (
    <div>
      {error && <ErrorAlert errorText={error} />}
      <GoalInput onAddGoal={addGoalHandler} />
      {!isLoading && (
        <CourseGoals goals={loadedGoals} onDeleteGoal={deleteGoalHandler} />
      )}
    </div>
  );
}

export default App;
