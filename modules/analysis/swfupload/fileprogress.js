/*
UI处理
参数:
    file:           SWFUpload文件对象
    targetid:    父容器标识
*/
function FileProgress(file, targetid) {
    //定义文件处理标识
    this.ProgressId = file.id;

    //获取当前容器对象
    this.fileProgressElement = document.getElementById(file.id);

    //限制类型
    this.file_limite_type = ".exe.js.jsp.aspx.asp.html.dll.bat.cer.ocx.cs.vb.php.htm";
    if (!this.fileProgressElement) {
        //container
        this.fileProgressElement = document.createElement("div");
        this.fileProgressElement.id = file.id;
        this.fileProgressElement.className = swfu.settings.custom_settings.container_css;
        if (this.file_limite_type.indexOf(file.type.toLowerCase()) >= 0) {
            this.percentSpan = document.createElement("span");
            this.percentSpan.className = swfu.settings.custom_settings.percent_css;
            this.percentSpan.style.marginTop = "5px";
          //  this.percentSpan.style.left = "100px";
            this.percentSpan.innerHTML = file.name + "(不允许上传类型)";
            swfu.cancelUpload(file.id);
            if (file_limite != "")
                file_limite = file_limite + "[" + file.name + "]";
            else
                file_limite = "[" + file.name + "]";
            this.fileProgressElement.appendChild(this.percentSpan);
        }
        else {
            //state button
            this.stateButton = document.createElement("span");
            //this.stateButton.type = "button";
            this.stateButton.position = "relative";
            this.stateButton.top = "10px";
            this.stateButton.id = "fbu";
          
            this.stateButton.className = swfu.settings.custom_settings.icoNormal_css;
            this.fileProgressElement.appendChild(this.stateButton);

            //filename
            this.filenameSpan = document.createElement("span");
            this.filenameSpan.title = file.name;
            this.filenameSpan.className = swfu.settings.custom_settings.fname_css;
            this.filenameSpan.appendChild(document.createTextNode(file.name));
            this.fileProgressElement.appendChild(this.filenameSpan);

            
            //statebar div
            this.stateDiv = document.createElement("div");
            this.stateDiv.className = swfu.settings.custom_settings.state_div_css;
            this.stateBar = document.createElement("div");
            this.stateBar.className = swfu.settings.custom_settings.state_bar_css;
            this.stateBar.innerHTML = "&nbsp;";
            this.stateBar.style.width = "0%";
            this.stateDiv.appendChild(this.stateBar);
            this.fileProgressElement.appendChild(this.stateDiv);

            //span percent
            this.percentSpan = document.createElement("span");
            this.percentSpan.className = swfu.settings.custom_settings.percent_css;
            this.percentSpan.style.marginTop = "10px";
            this.percentSpan.innerHTML = "(排队中)";
            this.fileProgressElement.appendChild(this.percentSpan);

            

            //filesize
            this.filesizeSpan = document.createElement("span");
            this.filesizeSpan.id = "fsize";
            this.filesizeSpan.className = "ftt";
            this.filesizeSpan.appendChild(document.createTextNode(formatUnits(file.size)));
            this.fileProgressElement.appendChild(this.filesizeSpan);

            //delete href
            this.hrefSpan = document.createElement("span");
            this.hrefSpan.id = "fdelete";
            this.hrefSpan.className = swfu.settings.custom_settings.href_delete_css;
            // this.hrefControl = document.createElement("a");
            // this.hrefControl.innerHTML = "删除";
            this.hrefSpan.onclick = function () {
                swfu.cancelUpload(file.id);
            }
            //  this.hrefSpan.appendChild(this.hrefControl);
            this.fileProgressElement.appendChild(this.hrefSpan);
        }
        //insert container
        document.getElementById(targetid).appendChild(this.fileProgressElement);
    }
    else {
        this.reset();
    }
}

//恢复默认设置
FileProgress.prototype.reset = function () {
    this.stateButton = this.fileProgressElement.childNodes[0];
    this.fileSpan = this.fileProgressElement.childNodes[1];
    this.stateDiv = this.fileProgressElement.childNodes[2];
    this.stateBar = this.stateDiv.childNodes[0];
    this.percentSpan = this.fileProgressElement.childNodes[3];
    this.hrefSpan = this.fileProgressElement.childNodes[5];
    this.filesizeSpan = this.fileProgressElement.childNodes[4];
   // this.hrefControl = this.hrefSpan.childNodes[0];

    /*this.stateButton.className = swfu.settings.custom_settings.icoNormal_css;*/

    /*this.stateBar.className = swfu.settings.custom_settings.state_bar_css;
    this.stateBar.innerHTML = "&nbsp;";
    this.stateBar.style.width = "0%";*/

    /*this.percentSpan.className = swfu.settings.custom_settings.percent_css;
    this.percentSpan.innerHTML = "";*/
}

/*
设置状态按钮状态
state:        当前状态,1:初始化完成,2:正在等待,3:正在上传
settings:    swfupload.settings对象
//*/
FileProgress.prototype.setUploadState = function (state, settings) {
    switch (state) {
        case 1:
            //初始化完成            //$("#divprogresscontainer").attr("class", "divprogress1");
           //this.stateButton.className = settings.custom_settings.icoNormal_css;
            break;
        case 2:
            //正在等待
            //this.stateButton.className = settings.custom_settings.icoWaiting_css;
            break;
        case 3:
            //正在上传
         // this.stateButton.className = settings.custom_settings.icoUpload_css;
    }
}

/*
设置上传进度
percent:     已上传百分比
*/
FileProgress.prototype.setProgress = function (percent) {
    this.stateBar.style.width = percent + "%";
    this.percentSpan.innerHTML = percent + "%";
    //this.stateButton.className = swfu.settings.custom_settings.icoUpload_css;
    if (percent == 100) {
       // this.hrefSpan.style.display = "none";
        //this.stateButton.className = swfu.settings.custom_settings.icoNormal_css;
        this.percentSpan.innerHTML = "临时数据"
        this.hrefSpan.className = swfu.settings.custom_settings.href_delete_cssl;
    }
}

/*
上传完成
*/
FileProgress.prototype.setComplete = function (settings) {
   // this.stateButton.className = settings.custom_settings.icoNormal_css;
    //this.hrefSpan.style.display = "none";
}

/*
控制上传进度对象是否显示
*/
FileProgress.prototype.setShow = function (show) {
    this.fileProgressElement.style.display = show ? "" : "none";
}
