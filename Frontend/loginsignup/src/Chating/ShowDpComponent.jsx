import { useRef, useState } from "react"
import "../Styles/ChatScreen.css"
import Dp from "../assets/dp.png"
const ShowDpComponent = (props) => {
    const inputFileRef = useRef()
    const [file, setFile] = useState(null)
    const [fileTempUrl, setFileTempUrl] = useState()

    // useEffect(() => {
    //     console.log("props changed---------------")
    //     console.log(props)
    //     console.log("props changed---------------")
    // }, [props])

    const handleDpChange = async () => {
        if (!file || !props.componentDetails.username || !props.componentDetails.isUserDp) {
            // console.log("you can't change this dp: requires all data which includes file, username and isuserdp checked")
            setFile(null)
            setFileTempUrl(null)
            return
        }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('username', props.componentDetails.username)
        formData.append('fileName', file.name)
        // for (const [key, value] of formData) {
        //     console.log(key + ": " + value)
        // }
        // console.log(formData)
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cloud/upload`, {
            method: 'POST',
            body: formData
        })
        const uploadedFileDetails = await result.json()
        // console.log(uploadedFileDetails)
        setFile(null)
        setFileTempUrl(null)

        const result2 = await fetch(`${import.meta.env.VITE_BACKEND_URL}/communication/change-dp`, {
            method: 'POST',
            headers: {
                // 'authorization': `${idToken}`, // Include token in the Authorization header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                { username: props.componentDetails.username, imageUrl: uploadedFileDetails.dbx_url }
            )
        })

        if (result2.status == 200) {
            props.changeShowDpComponentDetails({
                dpUrl: uploadedFileDetails.dbx_url,
                username: props.componentDetails.username,
                isUserDp: true
            })
            alert("Dp changed successfully !")
        }
        else {
            alert("An error occured !")
        }

        // return uploadedFileDetails
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])

        setFileTempUrl(URL.createObjectURL(e.target.files[0]))
        // console.log("file is changed")
    }

    const dpImageClicked = () => {
        inputFileRef?.current?.click()
    }

    const handleCloseWindow = () => {
        props.changeShowDpComponentDetails(null)
    }

    return (
        <div id="show-dp-component-div">
            {
                props?.componentDetails?.isUserDp ? <input type="file" ref={inputFileRef} onChange={handleFileChange} style={{ display: 'none' }} /> : ''
            }
            <div id="show-dp-detail-bar-div">
                <div id="show-dp-username-div">{props?.componentDetails?.username} {props?.componentDetails?.isUserDp ? " (Click your DP to Change it)" : ''}</div>
                <div id="show-dp-close-div" onClick={handleCloseWindow}>x</div>
            </div>
            <div id="show-dp-img-div">
                {
                    file ? <button onClick={handleDpChange} style={{ backgroundColor: "#6e00ff" }}>Change Dp</button> : ''
                }
                <img id="show-dp-img" src={fileTempUrl ? fileTempUrl : (props?.componentDetails?.dpUrl ? props.componentDetails.dpUrl : Dp)} alt="No DP found" onClick={dpImageClicked} />
            </div>
        </div>
    )
}

export default ShowDpComponent