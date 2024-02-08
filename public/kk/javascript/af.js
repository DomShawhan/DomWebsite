let readMessage = (id) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/kk/messages/" + id, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = "text";
    xhr.onreadystatechange = function() {
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if(xhr.responseText === "success") {
                let messageText = document.getElementById(id);
                messageText.remove();
                let messageNum = document.getElementById("message-num");
                let messageNumber = messageNum.textContent;
                let messageNumberMinus = Number(messageNumber);
                messageNum.innerHTML = messageNumberMinus - 1;
                document.getElementById("message-alert").innerHTML = "<div class=\"ui positive message\" role=\"alert\">You have marked a message as read.</div>";
            } else {
                document.getElementById("message-alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ xhr.responseText + "</div>";
            };
        };
    };
    xhr.onerror = (err) => {
        document.getElementById("message-alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ err + "</div>";
    }
    xhr.send(JSON.stringify({value: id}));
};

let deleteMessage = (id) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/kk/messages/delete/" + id, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = "text";
    xhr.onreadystatechange = function() {
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if(xhr.responseText === "success") {
                let messageText = document.getElementById("con-"+id);
                messageText.remove();
                document.getElementById("message-alert").innerHTML = "<div class=\"ui positive message\" role=\"alert\">You have deleted a message.</div>";
            } else {
                document.getElementById("message-alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ xhr.responseText + "</div>";
            };
        };
    };
    xhr.onerror = (err) => {
        document.getElementById("message-alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ err + "</div>";
    }
    xhr.send(JSON.stringify({value: id}));
};

let deleteAllRecShare = (id, user) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/kk/recipes/share/all/delete/" + user, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = "text";
    xhr.onreadystatechange = function() {
        if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if(xhr.responseText === "success") {
                document.getElementById(id).remove();
                document.getElementById("alert").innerHTML = "<div class=\"ui positive message\" role=\"alert\">You stopped sharing your recipes with " + user + ".</div>";
            } else {
                document.getElementById("alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">" + xhr.responseText + "</div>";
            };
        };
    };
    xhr.onerror = (err) => {
        document.getElementById("message-alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">" + err + "</div>";
    }
    xhr.send(JSON.stringify({sharedId: id}));
}

let userImgUpload = (id, value, e) => {
    let file = document.getElementById("image-input").files[0],
        url = "/kk/user/img";
    e.preventDefault();
    if(file !== undefined) {
        let xhr = new XMLHttpRequest();
        var formData = new FormData();   // the text data
        formData.append('img', file);
        xhr.responseType = "text";
        startLoader("loader");
        xhr.onreadystatechange = function() {
            if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                let resObj = JSON.parse(xhr.responseText)
                if(resObj.success === true) {
                    let filename = document.getElementById("image-input").files[0].name,
                        imageDisplay = document.getElementById("image-input-title"),
                        fileSubmit = document.getElementById("submit-form"),
                        userimg = document.getElementById("user-img"),
                        userId = id;
                    imageDisplay.innerHTML = "";
                    userimg.src = resObj.user.img.img;
                    document.getElementById("user-header-img").src = resObj.user.img.img;
                    document.getElementById("user-img-upload-form").setAttribute("onsubmit", "userImgUpload('" + userId + "', '', event)");
                    endLoader("loader");
                    document.getElementById("alert").innerHTML = "<div class=\"ui positive message\" role=\"alert\">You have uploaded a profile image.</div>";
                } else {
                    document.getElementById("alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ resObj.err.message + "</div>";
                };
            };
        };
        xhr.onerror = (err) => {
            console.log(err)
            document.getElementById("alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">"+ err.message + "</div>";
        }
        xhr.open('POST', url);
        xhr.send(formData);
    } else {
        return document.getElementById("alert").innerHTML = "<div class=\"ui negative message\" role=\"alert\">No image selected.</div>";
    }
}

let startLoader = (loaderId) => {
    let loader = document.getElementById(loaderId);
    loader.style.visibility = "visible";
    loader.style.opacity = 1;
}

let endLoader = (loaderId) => {
    let loader = document.getElementById(loaderId);
    loader.style.visibility = "hidden";
    loader.style.opacity = 0;
}