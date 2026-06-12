import React, { useState, useEffect, useRef, useCallback } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const List = ({ url }) => {
  const [list, setList] = useState([])
  const [originalList, setOriginalList] = useState([]) // cache full list for client-side filtering
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data?.success) {
        setOriginalList(response.data.data || [])
        setList(response.data.data || [])
      } else {
        toast.error(response.data?.message || 'Failed to fetch list')
      }
    } catch (err) {
      toast.error('Failed to fetch list')
    } finally {
      setLoading(false)
    }
  }

  const removeFood = useCallback(async (foodId) => {
    if (!foodId) return
    if (!window.confirm(`Delete this item? This action cannot be undone.`)) return
    setRemovingId(foodId)
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId })
      if (response.data?.success) {
        toast.success(response.data.message || 'Item removed')
        // update local cache to avoid refetching entire list
        setOriginalList(prev => prev.filter(i => i._id !== foodId))
        setList(prev => prev.filter(i => i._id !== foodId))
      } else {
        toast.error(response.data?.message || 'Error removing food')
      }
    } catch (err) {
      toast.error('Error removing food')
    } finally {
      setRemovingId(null)
    }
  }, [url])

  // Helper to render a single food item row
  const renderFoodItem = (item, idx) => {
    const id = item._id ?? idx
    return (
      <div key={id} className='list-table-format'>
        <img src={`${url}/images/` + item.image} alt={item.name || 'food'} onClick={() => navigate('/add', { state: { item } })} className='cursor' />
        <p>{item.name}</p>
        <p>{item.category}</p>
        <p>${item.price}</p>
        <div className='actions-cell'>
          <button
            className='btn btn-edit'
            onClick={() => navigate('/add', { state: { item } })}
            aria-label={`Edit ${item.name}`}
          >
            Edit
          </button>

          <button
            className='btn btn-delete'
            onClick={() => removeFood(item._id)}
            disabled={removingId === item._id}
            aria-label={`Delete ${item.name}`}
          >
            {removingId === item._id ? 'Removing…' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced client-side search to avoid API hammering on every keystroke
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const q = (query || '').trim().toLowerCase()
      if (!q) {
        setList(originalList)
        return
      }
      const filtered = originalList.filter(item => {
        return (
          (item.name || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
        )
      })
      setList(filtered)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, originalList])

  return (
    <div className='list add flex-col'>
      <div className='list-header'>
        <h2>All Foods</h2>
        <div className='list-controls'>
          <input
            aria-label='Search foods'
            className='list-search'
            placeholder='Search by name, category or description'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className='btn btn-add' onClick={() => navigate('/add')}>Add Item</button>
        </div>
      </div>
      <div className='list-table'>
        <div className='list-table-format title'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Actions</b>
        </div>

        {loading && (
          <div className='list-empty'>Loading…</div>
        )}

        {!loading && list.length === 0 && (
          <div className='list-empty'>
            <p>No items found.</p>
            <small>Try a different search or <span className='link' onClick={() => navigate('/add')}>add a new item</span>.</small>
          </div>
        )}

        {list.map((item, index) => renderFoodItem(item, index))}
      </div>
    </div>
  )
}

export default List
