module.exports = async function(user){
    var userBookings = await user.getAllBookings();
    
    return {
        fullName: user.displayName,
        email: user.email,
        bookings: {
            total: userBookings.length,
            pendingBookings: userBookings.filter(function(booking){
                return booking.status === 'pending';
            }).length,
            confirmedBookings: userBookings.filter(function(booking){
                return booking.status === 'confirmed';
            }).length
        }
    }
}