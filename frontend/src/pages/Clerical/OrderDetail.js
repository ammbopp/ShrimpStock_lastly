import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import './RequestDetail.css'; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const OrderDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
      order_id,
      order_date,
      order_status,
      employee_fname,
      employee_lname,
      employee_image,
      employee_id
    } = location.state || {};

  const [orderDetails, setOrderDetails] = useState([]);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    const fetchOrderDetails = async () => {
        const url = `http://localhost:3001/api/orders/${order_id}`;
        console.log('Request URL:', url); 
        const response = await fetch(url);
        const data = await response.json();
      
        if (response.ok) {
          setOrderDetails(data);
        } else {
          console.error('Error fetching request details:', data);
        }
      };
      

    fetchOrderDetails();
  }, [order_id]);

  const handleConfirmReceipt = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/update-order-status/${order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accept' }),
      });

      if (response.ok) {
        alert('Order status updated to "accept"');
        navigate('/clerical/orders', {
          state: {
            employee_fname,
            employee_lname,
            employee_image,
            employee_id,
          },
        });
      } else {
        const errorData = await response.json();
        console.error('Error updating request status:', errorData);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleRejectReceipt = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/update-order-status/${order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reject' }),
      });

      if (response.ok) {
        alert('Order status updated to "reject"');
        navigate('/clerical/orders', {
          state: { employee_fname, employee_lname, employee_image, employee_id },
        });
      } else {
        const errorData = await response.json();
        console.error('Error updating request status:', errorData);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const navigateToPage = (path) => {
    navigate(path, {
      state: {
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },
    });
  };

  return (
    <div>
      <div className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '60%', zIndex: 1000, backgroundColor: '#FFFFFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)' }}>
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img src={employeeImagePath} alt="User Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Side menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/clerical/home')}>Home</li>
          <li onClick={() => navigateToPage('/clerical/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/clerical/products')}>Products</li>
          <li onClick={() => navigateToPage('/clerical/requests')}>Requests</li>
          <li onClick={() => navigateToPage('/clerical/orders')}>Orders</li>
          <li onClick={() => navigateToPage('/clerical/audit')}>Audits</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main content */}
      <div className="content" style={{ marginTop: '200px' }}>

        {/* Displaying request details */}
        <div className="request-detail-card">
          <p><strong>📍 Order ID:</strong> {order_id}</p>
          <p><strong>Order Date:</strong> {new Date(orderDetails[0]?.order_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {orderDetails[0]?.order_status}</p>
          <br></br>
          <p><strong>✏️ Purchaser:</strong> {orderDetails[0]?.employee_fname} {orderDetails[0]?.employee_lname}</p>
          <p><strong>Employee ID:</strong> {orderDetails[0]?.employee_id}</p>

          {/* Displaying requested products */}
          <h2>Requested Products</h2>
          <div className="product-list">
            {orderDetails.map((item, index) => (
              <div key={index} className="product-item">

                <img src={`/product/${item.product_image}`} alt={item.product_name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                
                <div className="product-details">
                  <h3>{item.product_name}</h3>
                  <p>Quantity: {item.request_quantity}</p>
                  <p>Unit: {item.unit_name}</p>
                </div>
              </div>
            ))}
          </div>
          {orderDetails[0]?.order_status && orderDetails[0].order_status.toLowerCase() === 'waiting' && (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button className="reject-receipt-button" onClick={handleRejectReceipt}>Reject Receipt</button>
                          <button className="confirm-receipt-button" onClick={handleConfirmReceipt}>Confirm Receipt</button>
                      </div>
                      )}

        </div>
        {/* Confirm Receipt Button */}
        
      </div>
    </div>
  );
};

export default OrderDetail;
