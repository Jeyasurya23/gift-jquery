$(document).ready(function () {
  // Back to Top Button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $("#backToTop").fadeIn();
    } else {
      $("#backToTop").fadeOut();
    }
  });

  $("#backToTop").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 800);
    return false;
  });

  // Smooth Scrolling for Navigation Links
  $('a[href^="#"]').on("click", function (e) {
    e.preventDefault();
    var target = $(this.hash);
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 70,
        },
        800
      );
    }
  });
  // Import products from products.json file
  // This will store all our product data
  let products = [];
  
  // Fetch products data from JSON file
  fetch('assets/products.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      products = data;
      // Initialize page with products once data is loaded
      renderProducts(1);
    })
    .catch(error => {
      console.error('Error loading products:', error);
      $('#featuredProducts').html('<div class="col-12 text-center"><p>Error loading products. Please try again later.</p></div>');
    });

  // Function to render products with pagination
  function renderProducts(page = 1) {
    const productsPerPage = 8;
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    const productsHTML = paginatedProducts.map(product => `
      <div class="col-md-4 col-lg-3 mb-4">
        <div class="product-card">
          <img src="${product.image}" alt="${product.name}" class="img-fluid">
          <div class="product-info">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <span>₹${product.price.toLocaleString("en-IN")}</span>
            <button class="btn btn-primary btn-add-to-cart" data-id="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join("");

    $("#featuredProducts").html(productsHTML + `
      <div class="col-12" id="pagination"></div>
    `);
    renderPagination(page);
  }

  // Function to render pagination
  function renderPagination(currentPage) {
    const totalPages = Math.ceil(products.length / 8);
    let paginationHTML = '';

    // Add Previous button
    paginationHTML += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Add Next button
    paginationHTML += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;

    $("#pagination").html(`
      <nav aria-label="Product navigation">
        <ul class="pagination justify-content-center">
          ${paginationHTML}
        </ul>
      </nav>
    `);
  }

  // Handle pagination clicks
  $(document).on('click', '.page-link', function(e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    if (isNaN(page) || $(this).parent().hasClass('disabled')) return;
    renderProducts(page);
    $('html, body').animate({
      scrollTop: $("#featured").offset().top - 70
    }, 500);
  });

  // Shopping cart functionality
  let cart = [];

  // Add to cart
  $(document).on('click', '.btn-add-to-cart', function() {
    const productId = $(this).data('id');
    const product = products.find(p => p.id === productId);

    if (product) {
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      updateCart();
      showToast(`${product.name} added to cart`);
    }
  });

  // Update cart
  function updateCart() {
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    $('.cart-count').text(cartCount);
    $('#cartTotal').text(cartTotal.toLocaleString('en-IN'));

    const cartHTML = cart.map(item => `
      <div class="cart-item mb-3">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;">
          <div class="ms-3 flex-grow-1">
            <h6 class="mb-0">${item.name}</h6>
            <div class="d-flex align-items-center mt-2">
              <button class="btn btn-sm btn-outline-secondary me-2 btn-decrease-quantity" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary ms-2 btn-increase-quantity" data-id="${item.id}">+</button>
              <span class="ms-auto">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-danger ms-3 btn-remove-item" data-id="${item.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    $('#cartItems').html(cart.length ? cartHTML : '<p class="text-center my-4">Your cart is empty</p>');
  }

  // Show toast message
  function showToast(message) {
    const toast = $(`
      <div class="toast position-fixed bottom-0 end-0 m-3" role="alert">
        <div class="toast-header">
          <strong class="me-auto">Success!</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>
    `);

    $('body').append(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    setTimeout(() => toast.remove(), 3000);
  }

  // Cart item quantity controls
  $(document).on('click', '.btn-increase-quantity', function() {
    const id = $(this).data('id');
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += 1;
      updateCart();
    }
  });

  $(document).on('click', '.btn-decrease-quantity', function() {
    const id = $(this).data('id');
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      updateCart();
    }
  });

  $(document).on('click', '.btn-remove-item', function() {
    const id = $(this).data('id');
    cart = cart.filter(item => item.id !== id);
    updateCart();
  });

  // Initialize
  renderProducts(1);
  updateCart();

  // Cart Button Click Handler
  $("#cartBtn").click(function () {
    $("#cartModal").modal("show");
  });

  // Checkout Button Handler
  $("#checkoutBtn").click(function () {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Here you would typically redirect to a checkout page
    alert("Proceeding to checkout...");
    // window.location.href = '/checkout';
  });

  // Search Form Submission
  $("form.d-flex").on("submit", function (e) {
    e.preventDefault(); // Prevents form from submitting traditionally
  });

  // Add pagination container
  $("#featured").after('<div id="pagination" class="mt-4"></div>');
});
// Contact Form Submission
$("#contactForm").on("submit", function(e) {
    e.preventDefault(); // Prevent form from submitting traditionally   
    // Get form values
    const name = $(this).find('input[type="text"]').val();
    const email = $(this).find('input[type="email"]').val(); 
    const message = $(this).find('textarea').val();
    // Basic validation
    if (!name || !email || !message) {
        alert("Please fill in all fields");
        return;
    }
    // For demo, show success message
    alert("Thank you for your message! We'll get back to you soon.");  
    // Clear the form
    this.reset();
});
