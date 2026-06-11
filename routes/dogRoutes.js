const { Router } = require('express');
const dogController = require('../controllers/dogController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = Router();

router.get('/register', requireAuth, dogController.register_dog_get);
router.post('/register', requireAuth, dogController.register_dog_post);

router.get('/adopt', requireAuth, dogController.adopt_dog_get);
router.post('/adopt', requireAuth, dogController.adopt_dog_post);

router.get('/registered', requireAuth, dogController.list_registered_dogs_get);
router.get('/adopted', requireAuth, dogController.list_adopted_dogs_get);

router.delete('/remove/:id', requireAuth, dogController.remove_dog_delete);



module.exports = router;