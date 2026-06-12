import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({category}) => {

    const {food_list, searchQuery, liveQuery} = useContext(StoreContext)
  const q = (liveQuery || searchQuery || '').trim().toLowerCase();
  const filtered = food_list.filter((item) => {
    const matchesCategory = (category === "All" || category === item.category);
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const matchesSearch = q === '' || name.includes(q) || desc.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        <div className="food-display-list">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <FoodItem key={item._id} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />
            ))
          ) : (
            <div className="no-items">No items found for "{q}"</div>
          )}
        </div>
    </div>
  )
}

export default FoodDisplay
