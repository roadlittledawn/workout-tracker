# I must confess this is a mess

Need to rearchitect this so not all the things are in `dashboard.js`.

I'd like to:

- Fully configure goals via goals.json
  - Could specify "recipes" for a goal that knows what UI should be, what data to get, how to shape and visualize it
  - Document / create schema for goals.json, and other required data for each activity and its visualizations
- Create higher order UI components for each activity
  - These components will use newly created data helper utils to reshape standard strava data into a format that can be used for said chart
- Create core wrapper components for charts
