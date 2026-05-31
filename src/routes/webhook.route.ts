import { Router } from 'express';
import { createBin, receiveBin, getBinRequests, clearBin } from '../controllers/webhook.controller';
 
const router = Router();
 
// Create a new webhook bin (called by frontend on page load)
router.post('/bins', createBin);
 
// Get requests for a bin (polling)
router.get('/bins/:slug', getBinRequests);
 
// Clear all requests for a bin
router.delete('/bins/:slug/requests', clearBin);
 
// Receive webhooks — ALL HTTP methods on /hook/:slug
// These are the URLs given to the user to trigger
router.all('/hook/:slug', receiveBin);
 
export default router;