import "../../../style.css";

export default function Uploader({ setProfilePic }) {
    const onFormSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // data of fetch:
        const formData = new FormData(form);
        fetch("/profile_pic", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success === true) {
                    console.log(data.message);
                    // console.log("data in POST profile_pic ", data);

                    const newProfilePic = data.profilePic;
                    setProfilePic(newProfilePic);
                } else {
                    console.log(data.message);
                }
                // the function call above will ALSO cause the uploader to be hidden.
            });
    };

    return (
        <div className="profilePicUploader-bigcont">
            <form
                className="profilePicUploader-smlcont"
                onSubmit={onFormSubmit}
            >
                <p>Please upload your profile pic</p>
                <input type="file" accept="image/*" name="file" />

                <input type="submit" value="Upload" />
            </form>
        </div>
    );
}
