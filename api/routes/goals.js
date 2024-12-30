import express from 'express';
import { createGoal, updateGoal, deleteGoal } from '../controllers/goals.js';
import { authMiddleware } from '../middlewares/auth.js';
import User from '../models/user.js'; // Import User model

const router = express.Router();

// POST /api/goals - Create a new goal
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Sanitize the request body data
        const { name, goalType, targetValue, startDate, endDate } = req.body;


        // Call the createGoal function from the controller
        await createGoal(req, res);
    } catch (error) {
        // Log any errors during goal creation
        console.error('Error creating goal in routes:', error);

        // Respond with a server error message if an error occurred during goal creation
        res.status(500).json({ message: 'Server error during goal creation' });
    }
});


// PUT /api/goals/:goalId - Update an existing goal
router.put('/:goalId', authMiddleware, async (req, res) => {
    try {
        const { goalId } = req.params;
        if (!goalId) {
            return res.status(400).json({ message: 'Goal ID is required' });
        }

        // Call the updateGoal function from the controller
        await updateGoal(req, res);
    } catch (error) {
        // Log any errors during goal update
        console.error('Error updating goal in routes:', error);

        // Respond with a server error message if an error occurred during goal update
        res.status(500).json({ message: 'Server error during goal update' });
    }
});

// DELETE /api/goals/:goalId - Delete a goal
router.delete('/:goalId', authMiddleware, async (req, res) => {
    try {
        const { goalId } = req.params;
        if (!goalId) {
            return res.status(400).json({ message: 'Goal ID is required' });
        }


        // Call the deleteGoal function from the controller
        await deleteGoal(req, res);
    } catch (error) {
        // Log any errors during goal deletion
        console.error('Error deleting goal in routes:', error);

        // Respond with a server error message if an error occurred during goal deletion
        res.status(500).json({ message: 'Server error during goal deletion' });
    }
});


// GET /api/goals/:goalId - Get a specific goal
router.get('/:goalId', authMiddleware, async (req, res) => {
    try {
        const { goalId } = req.params;
        const userId = req.user.id;

        if (!goalId) {
            return res.status(400).json({ message: 'Goal ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const goal = user.goals ? user.goals.find(goal => goal.id === goalId) : null;

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Respond with the goal data
        res.status(200).json(goal);

    } catch (error) {
        console.error('Error fetching goal by id in routes:', error);
        res.status(500).json({ message: 'Server error during goal retrieval' });
    }
});



export default router;