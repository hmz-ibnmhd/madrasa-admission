let cropper
const image = document.getElementById("cropImage")
const fileInput = document.getElementById("fileInput")
let cropBtn = document.getElementById("cropBtn")

// ബലൂൺ ഇമേജ് നേരത്തെ ലോഡ് ചെയ്തു വെക്കുന്നു
const balloon = new Image();
balloon.src = "baloon.png"; 

function openCrop(){
    document.getElementById("cropModal").style.display="flex"
}

function closeCrop(){
    document.getElementById("cropModal").style.display="none"
}

fileInput.addEventListener("change", function(e){
    const file = e.target.files[0]
    if(!file) return;

    if (image.src.startsWith('blob:')) {
        URL.revokeObjectURL(image.src);
    }
    
    const url = URL.createObjectURL(file)
    image.src = url

    cropBtn.disabled = false;
    cropBtn.classList.add("active");

    image.onload = function(){
        if(cropper){
            cropper.destroy()
        }
        cropper = new Cropper(image,{
            aspectRatio: 338/414,
            viewMode: 1,
            autoCropArea: 1,
            center: true,
            background: false,
            responsive: true,
            dragMode: 'move',
            zoomable: true
        });
    }
})

function generatePoster(){
    // 1. ഫോട്ടോ ക്രോപ്പ് ചെയ്തെടുക്കുന്നു
    const croppedCanvas = cropper.getCroppedCanvas({
        width: 320,
        height: 370
    })

    const poster = new Image()
    poster.src = "poster.png"

    poster.onload = function(){
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        canvas.width = poster.width
        canvas.height = poster.height

        // A. മെയിൻ പോസ്റ്റർ വരയ്ക്കുന്നു
        ctx.drawImage(poster, 0, 0)

        let width = 289 
        let height = 378
        let x = 130
        let y = 881
        let radius = 35

        // B. ഫോട്ടോ വരയ്ക്കുന്നു (Rounded Frame)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.clip()
        
        ctx.drawImage(croppedCanvas, x, y, width, height)
        ctx.restore()

        // C. ബലൂൺ വരയ്ക്കുന്നു (ഇത് ഫോട്ടോയ്ക്ക് മുകളിലായി വരും)
        // ബലൂണിന്റെ പൊസിഷനും സൈസും ഇവിടെ അഡ്ജസ്റ്റ് ചെയ്യാം
        let bW = 270; // ബലൂൺ വീതി
        let bH = 248; // ബലൂൺ ഉയരം
        let bX = x + width - 80; // ഫോട്ടോയുടെ വലതു വശത്തായി
        let bY = y + height - 245; // ഫോട്ടോയുടെ താഴെ ഭാഗത്തായി
        
        ctx.drawImage(balloon, bX, bY, bW, bH)

        // D. പേര് എഴുതുന്നു
        let name = document.getElementById("name").value
        if(name.length > 20) name = name.substring(0,20)

        ctx.fillStyle = "#d4a017"
        ctx.font = "bold 40px Arial"
        ctx.textAlign = "center"
        ctx.fillText(name, x + width/2, y + height + 60)

        // E. ഫൈനൽ ഔട്ട്പുട്ട് കാണിക്കുന്നു
        document.getElementById("resultPoster").src = canvas.toDataURL("image/png")
        document.querySelector(".container").style.display = "none"
        document.getElementById("cropModal").style.display = "none"
        document.getElementById("resultPage").style.display = "block"
    }
}

function downloadPoster(){
    let link = document.createElement("a");
    link.href = document.getElementById("resultPoster").src;
    link.download = "poster.png";
    link.click();
}

async function shareWhatsApp(){
    let img = document.getElementById("resultPoster");
    if(!img) return alert("Image not found");

    try {
        let response = await fetch(img.src);
        let blob = await response.blob();
        let file = new File([blob], "poster.png", { type: "image/png" });

        if(navigator.share){
            await navigator.share({
                files: [file],
                title: "Poster",
                text: "🌙✨"
            });
        } else {
            window.open("https://wa.me/?text=" + encodeURIComponent("Check this poster"), "_blank");
        }
    } catch(e) {
        alert("Error sharing image");
    }
}