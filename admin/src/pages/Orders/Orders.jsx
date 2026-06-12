import React, { useState, useEffect, useRef } from 'react'
import './Orders.css'
import { toast } from "react-toastify"
import axios from "axios"
import { assets } from "../../assets/assets"

const Orders = ({ url }) => {
   const [orders, setOrders] = useState([]);
   const [originalOrders, setOriginalOrders] = useState([])
   const [query, setQuery] = useState('')
   const [loading, setLoading] = useState(false)
   const [updatingId, setUpdatingId] = useState(null)
   const debounceRef = useRef(null)

   // 1. Fetch all orders from the server
   const fetchAllOrders = async () => {
      setLoading(true)
      try {
         const response = await axios.get(url + "/api/order/list")
         if (response.data.success) {
            setOriginalOrders(response.data.data || [])
            setOrders(response.data.data || [])
         } else {
            toast.error("Failed to fetch orders")
         }
      } catch (error) {
         toast.error("Error connecting to the server")
      } finally {
         setLoading(false)
      }
   }

   // 2. Handle order status updates from the admin panel
   const statusHandler = async (event, orderId) => {
      const newStatus = event.target.value;
      if (!orderId) return
      // optimistic update locally to improve responsiveness
      setUpdatingId(orderId)
      const previous = orders
      try {
         setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
         const response = await axios.post(url + "/api/order/status", {
            orderId,
            status: newStatus
         });
         if (response.data.success) {
            toast.success("Order status updated successfully");
         } else {
            // revert on failure
            setOrders(previous)
            toast.error("Failed to update status");
         }
      } catch (error) {
         setOrders(previous)
         toast.error("Error updating status")
      } finally {
         setUpdatingId(null)
      }
   }

   useEffect(() => {
      fetchAllOrders();
   }, []); 

   // Debounced search/filtering
   useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
         const q = (query || '').trim().toLowerCase()
         if (!q) {
            setOrders(originalOrders)
            return
         }
         const filtered = originalOrders.filter(order => {
            const customer = ((order.address?.firstName || '') + ' ' + (order.address?.lastName || '')).toLowerCase()
            const items = (order.items || []).map(i => i.name).join(' ').toLowerCase()
            const address = ((order.address?.street || '') + ' ' + (order.address?.city || '')).toLowerCase()
            return customer.includes(q) || items.includes(q) || address.includes(q)
         })
         setOrders(filtered)
      }, 300)
      return () => clearTimeout(debounceRef.current)
   }, [query, originalOrders])

     // Helper to render a single order row (inside component to access handlers/state)
     const renderOrder = (order, index) => {
        const id = order?._id ?? index
        const items = order?.items || []
        const addressParts = [order?.address?.city, order?.address?.state, order?.address?.country, order?.address?.zipcode].filter(Boolean).join(', ')

        return (
           <div key={id} className='order-item'>
              <img src={assets.parcel_icon} alt='Parcel Icon' />

              <div>
                 <p className='order-item-food'>
                    {items.map((item, idx) => (
                       <span key={idx}>{item.name} x {item.quantity}{idx < items.length - 1 ? ', ' : ''}</span>
                    ))}
                 </p>

                 <p className='order-item-name'>
                    {(order?.address?.firstName || '') + ' ' + (order?.address?.lastName || '')}
                 </p>

                 <div className='order-item-address'>
                    <p>{order?.address?.street}</p>
                    <p>{addressParts}</p>
                 </div>

                 <p className='order-item-phone'>{order?.address?.phone}</p>
              </div>

              <p>Items: {items.length}</p>
              <p className='order-item-price'>${order?.amount}</p>

              <select className='status-select' onChange={(event) => statusHandler(event, order?._id)} value={order?.status} disabled={updatingId === order?._id}>
                 <option value='Food Processing'>Food Processing</option>
                 <option value='Out for delivery'>Out for delivery</option>
                 <option value='Delivered'>Delivered</option>
              </select>
           </div>
        )
     }

   return (
    <div className='order add'>
         <div className='orders-header'>
            <h3>Orders</h3>
            <div className='orders-controls'>
               <input
                  aria-label='Search orders'
                  className='orders-search'
                  placeholder='Search by customer, item, or address'
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
               />
            </div>
         </div>

         <div className='order-list'>
            {loading && <div className='orders-empty'>Loading…</div>}

            {!loading && orders.length === 0 && (
               <div className='orders-empty'>
                  <p>No orders found.</p>
                  <small>Adjust filters or try again later.</small>
               </div>
            )}

              {orders.map((order, index) => renderOrder(order, index))}
         </div>
    </div>
   )
}

      // Helper to render a single order row
      function renderOrder(order, index) {
         const id = order._id ?? index
         const items = order.items || []
         const addressParts = [order.address?.city, order.address?.state, order.address?.country, order.address?.zipcode].filter(Boolean).join(', ')

         return (
            <div key={id} className='order-item'>
               <img src={assets.parcel_icon} alt='Parcel Icon' />

               <div>
                  <p className='order-item-food'>
                     {items.map((item, idx) => (
                        <span key={idx}>{item.name} x {item.quantity}{idx < items.length - 1 ? ', ' : ''}</span>
                     ))}
                  </p>

                  <p className='order-item-name'>
                     {(order.address?.firstName || '') + ' ' + (order.address?.lastName || '')}
                  </p>

                  <div className='order-item-address'>
                     <p>{order.address?.street}</p>
                     <p>{addressParts}</p>
                  </div>

                  <p className='order-item-phone'>{order.address?.phone}</p>
               </div>

               <p>Items: {items.length}</p>
               <p className='order-item-price'>${order.amount}</p>

               <select className='status-select' onChange={(event) => statusHandler(event, order._id)} value={order.status} disabled={updatingId === order._id}>
                  <option value='Food Processing'>Food Processing</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
               </select>
            </div>
         )
      }

export default Orders;