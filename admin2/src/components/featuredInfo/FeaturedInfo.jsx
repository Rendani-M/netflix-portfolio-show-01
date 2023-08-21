import "./featuredInfo.css";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function FeaturedInfo({progress, title, date, data}) {
  
  // const [progress, setProgress] = useState(0);
  function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  CircularProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     * @default 0
     */
    value: progress,
  };

  return (
    <Box className="featuredItem" sx={{width:{xs:'70%', sm: '70%', md:'70%'}, border:'1px solid red'}}>
      <div className="left">
        <span className="featuredTitle" style={{ color:'blue' }}>{date}</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">{title}</span>
        </div>
        <span className="featuredSub">Amount: {data}</span>
      </div>
      <div className="right">
        <CircularProgressWithLabel value={progress} style={{ transform: 'scale(3)' }}/>
      </div>
    </Box>
  );
}
