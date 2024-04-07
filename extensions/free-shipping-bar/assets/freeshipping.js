class CartShippingbar extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.freeshippinglimit = parseInt(this.getAttribute('data-freeshipping'));
    this.freeGiftlimit = parseInt(this.getAttribute('data-freegift'));

    this.updateFreeshippingbar();
  }
  updateFreeshippingbar(){
    fetch('/cart.js').then((data)=> data.json()).then((cartData)=>{
      this.updateRange(cartData);
    });
  }

  
  
  updateRange(cartdata){
    let bar = this.querySelector('.bar');
    let messagebar = this.querySelector('.message-bar');
    if(cartdata.total_price < this.freeGiftlimit){
      let width = (cartdata.total_price/this.freeGiftlimit)*100;
      console.log(width)
      bar.style.width = width +'%';
    }
    else{
      bar.style.width = '100%';
    }

  
    if(cartdata.total_price < this.freeGiftlimit){
      let awayPrice =  ((this.freeGiftlimit - cartdata.total_price)/100).toFixed(2)
      messagebar.innerHTML = "you are Rs."+ awayPrice +" away from free Gift"
    }
    else if(cartdata.total_price < this.freeshippinglimit){
       let awayPrice =  ((this.freeshippinglimit - cartdata.total_price)/100).toFixed(2)
       messagebar.innerHTML = "you are Rs."+ awayPrice +" away from free shipping"
    }
  }
  

}
customElements.define("cart-shipping-bar", CartShippingbar);

class Freeshipingbar extends HTMLElement {
constructor() {
  super();
}
connectedCallback() {
  this.rangebar = this.querySelector('.rangebar')
  this.message = this.querySelector('.text-message')
  this.limit = parseInt(this.getAttribute('data-limit'));
  this.giftProduduct = this.getAttribute('data-gift-product');
  this.updateShippingbar();
}

 updateShippingbar(){
   let productId = this.giftProduduct;
   
  fetch('/cart.js').then((data)=> data.json()).then((cartData)=>{
 
     if(cartData.total_price > this.limit){
      this.rangebar.style.width = '100%';
        this.message.innerHTML = " Free shipping";
    }
    else{
      let percentage = (cartData.total_price/this.limit)*100;
      this.rangebar.style.width = percentage +'%';
      let remainingprice =  ((this.limit - cartData.total_price)/100.00).toFixed(2)
      this.message.innerHTML = "you are away Rs"+ remainingprice;
    }
    let freeProductFound = false
      cartData.items.forEach(function(cartItem){
        if(cartItem.id == productId){
          freeProductFound = true
        }
      });
    
    if(cartData.total_price >= 25000){
      if(!freeProductFound){
        this.addFreeProduct()
      }  
    }else{
      console.log("enter in else condition",freeProductFound)
      if(freeProductFound){
        this.removeFreeProduct()
      }
    }
    
    return;
});
}
addFreeProduct(){
  let productId = this.giftProduduct
  let formData = {
     'items': [{
      'id': productId,
      'quantity': 1
      }]
    };
    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      setTimeout(function(){
        window.location.reload()  
      },500)
      
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
removeFreeProduct(){
  let productId =this.giftProduduct;
  console.log(typeof productId)
  let formData = {
      'id':productId,
      'quantity':0
    };
  console.log(formData)
    fetch(window.Shopify.routes.root + 'cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id':productId,
        'quantity':0
      })
    })
    .then(response => {
       setTimeout(function(){
         window.location.reload()  
      },200)
      return response.text();
    }).then((data)=>{
      
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
}
let cartShippingBar = `<div class="cart-shipping-bar">

<cart-shipping-bar data-freeshipping="10000" data-freegift="25000" data-freegiftproduct>
  <div class="top-bar">
    <div class="freeshipping">
      <img src="https://cdn.shopify.com/s/files/1/0695/5732/1967/files/freeshipping.png?v=1712395505">
    </div>
    <div class="freegift">
      <img src="https://cdn.shopify.com/s/files/1/0695/5732/1967/files/freegift.png?v=1712395540">
    </div>
  </div>
  <div class="rangebar-wrapper">
    <div class="bar"></div>
  </div>
  <div class="message-bar">
  </div>
</cart-shipping-bar>
</div>`;

function appendShippingbar(){
let cartForm = document.getElementById('CartDrawer-Form');
cartForm.insertAdjacentHTML("afterbegin",cartShippingBar)
}
const container = document.querySelector(".cart-drawer");
const observer = new MutationObserver((entries)=>{
  if(entries){
    let freeShippingbar = document.querySelector('free-shippingbar');
    freeShippingbar.updateShippingbar();
  }
});
appendShippingbar()
observer.observe(container, {
  childList: true,
  subtree: true,
});
customElements.define("free-shippingbar", Freeshipingbar);