const form = document.getElementById('barcode-form');
const barcodeInput = document.getElementById('barcode-input');
const resultDiv = document.getElementById('result');
const imageContainer = document.getElementById('image-container');

const imageElement = document.createElement('img');

form.addEventListener('submit', function(event) {
  event.preventDefault();

    const barcode = barcodeInput.value.trim();

    checkBarcodeInAPI(barcode);

});

function getLastMonthDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}${day}${year}`;
}

function checkBarcodeInAPI(barcode) {

    const OPENFOODFACTS_API_URL_Barcode = `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`;

    fetch(OPENFOODFACTS_API_URL_Barcode)
              .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                        imageElement.src = '';
                        imageElement.src = "images/trash.png";
                        imageContainer.appendChild(imageElement);

                        resultDiv.innerHTML = 'The item cannot be found! Try scanning the barcode again.';
                  }
            })
            .then(data => {

                const recallCompany = data.product.brands;

                const recallSearchTerm = data.product.product_name;

                function concatenateRecallCompany(recallcompany) {
                  return recallcompany.split(' ').join('+');
                }

                const formatRecallCompany = concatenateRecallCompany(recallCompany);

                function concatenateRecallSearchTerm(recallsearchterm) {
                  return recallsearchterm.split(' ').join('+');
                }

                const formatRecallSearchTerm = concatenateRecallSearchTerm(recallSearchTerm);

                const FDA_API_URL = `https://api.fda.gov/food/enforcement.json?search=product_description:${encodeURIComponent(formatRecallSearchTerm)}+AND+recalling_firm:${encodeURIComponent(formatRecallCompany)}`;

                    fetch(FDA_API_URL)

                    .then(response => {
                    if (!response.ok) {
                      throw new Error(`Network response was not ok: ${response.status}`);
                     } 
                     return response.json();
                    })

                    .then(datas => {

                      if (datas) {
                      datas.results.forEach(productitem => {
                          const description = productitem.description;
                          var recallStatus = productitem.status;
                          var recallFirm = productitem.recalling_firm;
                           var recallProduct = productitem.product_description;
                            const recallReason = productitem.reason_for_recall;
                            const recallDate = productitem.report_date;

                          if ((recallFirm = recallCompany) && (recallProduct = recallSearchTerm) && (recallStatus !== 'Terminated')) {

                    const recallInformation = document.createElement('div');
                    
                    const recalls = document.getElementById('recalls');
         
                    recalls.innerHTML = '';

                    recallInformation.innerHTML = '';

                    recalls.innerHTML = `
                    <hr style="border:none; border-bottom: 1px solid #eeeeee;"><br>
                    <strong>Notice Date:</strong> ${recallDate} <br>
                    <strong>Brand:</strong> ${recallFirm} <br>
                    <strong>Product Description:</strong> ${recallProduct}<br>
                    <strong>Status:</strong> ${recallStatus} <br><br>
                    <div style='border: 2px solid red; border-radius: 10px; padding: 20px;'>
                    <strong>Reason for recall:</strong> ${recallReason} 
                    </div> <br><br>
                    <hr style="border:none; border-bottom: 1px solid #eeeeee;">`;
                    

                    imageElement.src = '';
                    productImage(barcode);
                    resultDiv.innerHTML = '<div class="recalled">The item has been recalled!</div>';

                    productNameContainer.innerHTML = '';
                    productNameContainer.appendChild(recallInformation);
                    } else {
                      imageElement.src = '';
                        productImage(barcode);
                        resultDiv.innerHTML = '<div class="notrecalled">The item has NOT been recalled!</div>';
                    }
                  })

                } else { 
                  imageElement.src = '';
                  recalls.innerHTML = '';
                  productImage(barcode);
                      resultDiv.innerHTML = '<div class="notrecalled">The item has NOT been recalled!</div>';
                }
                    })

                    .catch(error => {
                      imageElement.src = '';
                  recalls.innerHTML = '';
                  imageContainer.innerHTML = '';
                  console.error('The item was not found in a recall.', error.message);
                  productImage(barcode);
                      resultDiv.innerHTML = '<div class="notrecalled">The item has NOT been recalled!</div>';
                      });
                      
                  })
                }
            
        function productImage(barcode) {

            const OPENFOODFACTS_API_URL = `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`;

            fetch(OPENFOODFACTS_API_URL)
              .then(response => response.json())
              .then(openFoodFactsData => {

                if (openFoodFactsData) {
                  const imageUrl = openFoodFactsData.product.image_url;

                  imageElement.src = imageUrl;
                  imageContainer.appendChild(imageElement);

            } else {
                console.log('No product information found.');
                imageContainer.innerHTML = "<img src='images/trash.png'>";
              }
              })
            .catch(error => {
                console.error('Error retrieving image from Open Food Facts API:', error);
                imageContainer.innerHTML = 'An error occurred while retrieving the image.<br><br>';
              });
            }

async function fetchRecentRecalls() {
  const lastMonthDate = getLastMonthDate();

  const searchQuery = `${lastMonthDate}`;
  const encodedSearchQuery = encodeURIComponent(searchQuery);

    const apiUrl = `https://api.fda.gov/food/enforcement.json?search=country:"United+States"+AND+report_date:[${encodeURIComponent(encodedSearchQuery)}+TO+*]&sort=report_date:desc&limit=50`;

  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const recalldata = await response.json();
      const recallList = document.getElementById('recallList');

      if (recalldata) {
          recalldata.results.forEach(recall => {
              const recallItem = document.createElement('div');
              const recallDate = recall.report_date;
              const productDescription = recall.product_description;
              const status = recall.status;
              const recallBrand = recall.recalling_firm;

              recallItem.innerHTML = `
                  <strong>Brand:</strong> ${recallBrand}<br>
                  <strong>Recall Date:</strong> ${recallDate}<br>
                  <strong>Product Description:</strong> ${productDescription}<br>
                  <strong>Status:</strong> ${status}<br><br>
                  <hr style="border:none; border-bottom: 1px solid #eeeeee;">
                  <br><br>
              `;
              recallList.appendChild(recallItem);
          });
      } else {
          recallList.innerHTML = 'No recent recalls found in the last month.';
      }
  } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
  }
}
