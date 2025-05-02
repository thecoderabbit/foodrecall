const scannerWindow = document.querySelector('.video-container');

function scanUpcCode() {
  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('.video-container'),
      constraints: {
        width: { max: 375 },
        height: { max: 380 },
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["upc_reader"]
    }
  }, function (err) {
    if (err) {
      console.log(err);
      return;
    }

    scannerWindow.style.display = "block";
    Quagga.start();
  });

  Quagga.onDetected(function(result) {
    const upcInput = document.getElementById('barcode-input');
    upcInput.value = result.codeResult.code;
    scannerWindow.style.display = "none";
    Quagga.stop();
  });
}