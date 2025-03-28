import { useState, useEffect } from "react";

function LogoutSpecificDevice() {
    const [queryData, setQueryData] = useState(null);
    const [message, setMessage] = useState(null)

    useEffect(() => {
        // Get the query string from the URL
        const queryString = window.location.search;  // E.g. "?id=123&name=John"

        // Create a URLSearchParams object to work with the query string
        const params = new URLSearchParams(queryString);

        // Extract query parameters
        const email = params.get('email');    // Get 'id' parameter
        const objectId = params.get('object_id'); // Get 'name' parameter

        // Set the extracted data to state
        setQueryData({ email, objectId });

        fetch(`${import.meta.env.VITE_BACKEND_URL}/logoutspecificaccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                device_id: objectId
            })
        }).then((res1) => res1.json()).then((res2) => {
            setMessage(res2.message)
        })
    }, []); // Empty dependency array means it runs once on mount

    return (
        <div style={message ? { display: "flex", color: "black" } : { display: "flex", color: "darkgray" }}>
            {message ? message : 'processing...'}
        </div>
    )
}

export default LogoutSpecificDevice