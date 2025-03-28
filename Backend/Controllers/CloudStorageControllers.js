import { Dropbox } from 'dropbox';
import { config } from 'dotenv';
config();
import * as fs from 'fs'
import fetch from 'node-fetch';
import { DropboxAuth } from 'dropbox';

// Initialize Dropbox SDK
const reDirectURL = `${process.env.BACKEND_URL}/cloud/get-refresh-token`
const tokensFilePath = './tokens.json';
const tokens = readTokens()
var dbx = new Dropbox({
    // accessToken: tokens?.access_token,
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    fetch: fetch,
});

const authDbx = new DropboxAuth({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch: fetch,
})


// Function to read tokens from the tokens.json file
function readTokens() {
    try {
        const data = fs.readFileSync(tokensFilePath, 'utf8');
        // console.log(data)
        // console.log(JSON.parse(data))
        return JSON.parse(data);
    } catch (error) {
        console.log('Error reading tokens:', error);
        return null;
    }
}

// Function to write updated tokens back to the tokens.json file
function saveTokens(tokens) {
    // console.log(tokens)
    try {
        fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2), 'utf8');
    } catch (error) {
        console.log('Error saving tokens:', error);
    }
}

export const Test = async (req, res) => {
    try {
        // var allTokens = readTokens()
        // const token = allTokens.access_token

        // console.log(token.split('.'))
        // dbx = new Dropbox({
        //     accessToken: tokens.access_token,
        //     refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        //     fetch: fetch,
        // });
        // const response = await dbx.usersGetCurrentAccount();
        // console.log(response.status)
        // console.log("---------------------------------")
        // console.log(response.error.error.error_summary)




        res.send(":)")
    } catch (error) {
        // console.log(error.status)
        // console.log("---------------------------------")
        // console.log(error.error.error_summary)
        console.log(error)
        res.send(":(")
    }

}

async function refreshAccessToken() {
    const url = 'https://api.dropbox.com/oauth2/token';

    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
        client_id: process.env.DROPBOX_APP_KEY,
        client_secret: process.env.DROPBOX_APP_SECRET,
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error('Error refreshing access token: ' + response.statusText);
    }

    const data = await response.json();
    const { access_token } = data;
    saveTokens({ "access_token": access_token })
    dbx.accessToken = access_token
    // saveTokens({ "access_token": access_token })

    // console.log('New Access Token:', access_token);
    // console.log('New refresh Token:', refresh_token);
    return access_token;  // Use this new token to make API requests
}


// async function refreshAccessToken() {
//     try {
//         // Refresh the access token
//         const tokenResponse = authDbx.refreshAccessToken([process.env.DROPBOX_REFRESH_TOKEN]);
//         // const { access_token } = tokenResponse.result;

//         console.log('New Token response>>>:', tokenResponse);
//         return tokenResponse;
//     } catch (error) {
//         console.error('Error refreshing access token:', error);
//         throw error;
//     }
// }

// const tokenResponse = await dbx.refreshAccessToken(refreshToken);
// const { access_token } = tokenResponse.result;


// dbx.auth
// authDbx.getRefreshToken()

export const DropboxAuthentication = async (req, res) => {
    const authURL = await authDbx.getAuthenticationUrl(reDirectURL, null, 'code', 'offline')
    res.redirect(authURL)
}

// export const getRefreshToken = async (req, res) => {
//     // console.log("checkpoint 1")
//     const { code } = req.query
//     try {
//         // console.log("checkpoint 2")
//         const tokenResponse = await authDbx.getAccessTokenFromCode(reDirectURL, code)
//         const { access_token, refresh_token } = tokenResponse.result;

//         // console.log("access Token : " + access_token)
//         // console.log("refrsh Token : " + refresh_token)

//         res.send("auth successfull")
//     } catch (error) {
//         console.log("error in getting tokens from code")
//         console.log(error)
//     }
// }



// Upload file to Dropbox
export const Upload = async (req, res) => {
    // console.log(typeof req.body)
    const localFilePath = req.file.path;
    const { username, fileName } = req.body

    // if (!dbx.accessToken) {
    // dbx.accessToken = tokens.access_token
    // }


    dbx = new Dropbox({
        accessToken: tokens.access_token,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        fetch: fetch,
    });


    // const { formData } = req.body
    // console.log(formData)
    // const { formData } = req.body
    // console.log(req.body)
    // console.log("username>>> : " + username)
    // const fileData=req.username

    // const localFilePath = "uploads\\vdo.mp4";

    // console.log("--------------------------------------")
    // console.log(localFilePath)
    // console.log("--------------------------------------")

    try {
        // console.log("we are in getting user account info")
        await dbx.usersGetCurrentAccount();
    } catch (error) {
        // console.log("error in getting dbx user account info !")
        // console.error.error?.error_summary
        // console.log("it contains: ", error.error?.error_summary.includes("expired_access_token"))
        if (error.error?.error_summary.includes("expired_access_token")) {
            await refreshAccessToken()
            // console.log("token refreshed !")
        }
    }
    dbx = new Dropbox({
        accessToken: tokens.access_token,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        fetch: fetch,
    });

    try {
        const fileType = "." + fileName.split('.')[fileName.split('.').length - 1]
        const newUniqueFileName = username + Number(new Date()).toString() + fileType
        const dropboxFilePath = `/testing123/${newUniqueFileName}`; // Path in Dropbox

        // Read the uploaded file
        fs.readFile(localFilePath, (err, data) => {
            if (err) {
                // console.log('Error reading file:', err);
                fs.unlinkSync(localFilePath);
                return res.status(500).send('File read error');
            }

            // Upload the file to Dropbox
            dbx.filesUpload({ path: dropboxFilePath, contents: data })
                .then(() => {
                    // console.log('File uploaded to Dropbox:', response);

                    // BELOW LINE DELETES THE FILE FROM SERVER DIRECTORY
                    fs.unlinkSync(localFilePath);

                    // Create a permanent shared link for the uploaded file
                    return dbx.sharingCreateSharedLinkWithSettings({ path: dropboxFilePath });
                })
                .then(sharedLinkResponse => {
                    // console.log('Shared link created:', sharedLinkResponse);
                    res.json({ dbx_url: sharedLinkResponse.result.url + "&raw=1", file_type: fileType, file_name: newUniqueFileName }); // Send the shared link to frontend
                })
                .catch(async error => {
                    fs.unlinkSync(localFilePath);
                    // console.log(error.error?.error_summary)
                    console.error('Error uploading file:', error);
                    res.status(500).send({ message: 'Error uploading file, please try again' });
                });
        });
    } catch (error) {
        console.log("error in uploading file : " + error)
    }
};

export const deleteFile = async (fileUrl) => {
    try {
        // Get metadata for the shared link to extract file path
        // console.log(fileUrl)
        const response = await dbx.sharingGetSharedLinkMetadata({ url: fileUrl });
        // console.log(response)

        // Extract the file path from the response
        const filePath = response.result.path_lower;

        // Call the API to delete the file
        await dbx.filesDeleteV2({ path: filePath });
        // console.log('File deleted successfully:', deleteResponse);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

export const asd = (req, res) => {
    const { url } = req.body
    deleteFile(url)
    res.send("completed")
}

// use raw = 1 in the last of the shared link given by the dropbox to view the file in the normal html window and use easily

