import React, { useEffect, useState } from "react";
import LogoutButton from "../../components/auth/LogoutButton";

export default function Admin() {
  const API_BASE = import.meta.env.VITE_API_BASE;

  const [apiStats, setApiStats] = useState([]);
  const [userConsumption, setUserConsumption] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatsErr, setApiStatsErr] = useState("");
  const [userConsumptionErr, setUserConsumptionErr] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setApiStatsErr("");
    setUserConsumptionErr("");
    
    try {
      // Fetch API Stats
      try {
        const apiStatsRes = await fetch(`${API_BASE}/get-api-stats`, {
          method: "GET",
          credentials: "include",
        });
        
        if (!apiStatsRes.ok) {
          setApiStatsErr(`Failed to load API stats (${apiStatsRes.status}). Please ensure the server is running and has been restarted.`);
        } else {
          const apiStatsData = await apiStatsRes.json();
          setApiStats(Array.isArray(apiStatsData.apiStats) ? apiStatsData.apiStats : []);
        }
      } catch (e) {
        setApiStatsErr(`Error loading API stats: ${e.message}`);
      }

      // Fetch User Consumption
      try {
        const userConsumptionRes = await fetch(`${API_BASE}/get-user-consumption`, {
          method: "GET",
          credentials: "include",
        });
        
        if (!userConsumptionRes.ok) {
          setUserConsumptionErr(`Failed to load user consumption (${userConsumptionRes.status}). Please ensure the server is running and has been restarted.`);
        } else {
          const userConsumptionData = await userConsumptionRes.json();
          setUserConsumption(Array.isArray(userConsumptionData.userConsumption) ? userConsumptionData.userConsumption : []);
        }
      } catch (e) {
        setUserConsumptionErr(`Error loading user consumption: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="px-3 py-2 rounded-lg bg-black text-white text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <LogoutButton />
          </div>
        </div>

        {(apiStatsErr || userConsumptionErr) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 space-y-2">
            {apiStatsErr && <div>⚠️ {apiStatsErr}</div>}
            {userConsumptionErr && <div>⚠️ {userConsumptionErr}</div>}
            <div className="text-sm mt-2 text-red-700">
              <strong>Note:</strong> If you see 404 errors, please restart your backend server to load the new routes.
            </div>
          </div>
        )}

        {/* API Stats Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">API Stats</h2>
          </div>
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Number of Requests</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 3 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : apiStatsErr ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-red-500 text-center">
                    {apiStatsErr}
                  </td>
                </tr>
              ) : apiStats.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500 text-center">
                    No API stats found.
                  </td>
                </tr>
              ) : (
                apiStats.map((stat, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{stat.Method}</td>
                    <td className="px-4 py-3">{stat.Endpoint}</td>
                    <td className="px-4 py-3">{stat['Number of Requests']}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User Consumption Table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">User Consumption</h2>
          </div>
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total number of requests</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 3 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : userConsumptionErr ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-red-500 text-center">
                    {userConsumptionErr}
                  </td>
                </tr>
              ) : userConsumption.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-gray-500 text-center">
                    No user consumption data found.
                  </td>
                </tr>
              ) : (
                userConsumption.map((user, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{user.Name}</td>
                    <td className="px-4 py-3">{user.Email}</td>
                    <td className="px-4 py-3">{user['Total number of requests']}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
