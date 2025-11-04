# Mock Data Implementation

This directory contains mock JSON data files that provide realistic demo data for all dashboards and pages when the backend API is not available.

## Files

### `customers.json`
Contains customer data including:
- Customer profiles with personal information
- Booking history and status
- Addresses and preferences
- Statistics (total bookings, ratings, etc.)

### `vendors.json`
Contains vendor/salon data including:
- Vendor profiles and business information
- Services offered with pricing
- Appointment history
- Revenue and earnings data

### `beauticians.json`
Contains beautician data including:
- Professional profiles and certifications
- Skills and experience
- Application status and approval workflow
- Earnings and booking statistics

### `admin.json`
Contains admin dashboard data including:
- System analytics and metrics
- Recent activity logs
- Revenue charts data
- Pending approvals and top performers

### `managers.json`
Contains manager-specific data including:
- Pending vendor applications
- Pending beautician applications
- Manager statistics and approvals
- Application review workflow

## Usage

The mock data is automatically loaded when:
1. Backend API calls fail
2. Development mode is running without backend
3. Demo mode is enabled

## Data Structure

All mock data follows realistic patterns:
- **IDs**: Sequential or UUID-like identifiers
- **Dates**: Recent dates in ISO format
- **Currency**: CDF (Congolese Franc) amounts
- **Statuses**: Realistic workflow states (pending, approved, completed, etc.)
- **Relationships**: Proper foreign key relationships between entities

## Benefits

1. **No Backend Required**: Full functionality without API server
2. **Realistic Data**: Proper data relationships and realistic values
3. **Consistent Experience**: Same data across all dashboard views
4. **Development Speed**: No need to set up database for frontend development
5. **Demo Ready**: Perfect for client demonstrations

## Customization

To modify mock data:
1. Edit the respective JSON files
2. Ensure data relationships remain consistent
3. Update TypeScript interfaces if needed
4. Test all affected dashboards

## Integration

Mock data is integrated through:
- `src/utils/mockData.ts` - Utility functions
- Individual dashboard components - Direct imports
- Fallback mechanisms in data fetching functions

## Future Enhancements

- Add more diverse data sets
- Implement data generation scripts
- Add data validation
- Create data seeding utilities
