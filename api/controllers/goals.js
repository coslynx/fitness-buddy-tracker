import User from '../models/user.js';

const createGoal = async (req, res) => {
    try {
        const { name, goalType, targetValue, startDate, endDate } = req.body;
        const userId = req.user.id;

        if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return res.status(400).json({ message: 'Goal name is required and must be at least 1 character long' });
        }

        if (!goalType || typeof goalType !== 'string' || goalType.trim().length < 1) {
             return res.status(400).json({ message: 'Goal type is required and must be at least 1 character long' });
        }


        if (!targetValue || typeof targetValue !== 'number' || targetValue <= 0) {
            return res.status(400).json({ message: 'Target value is required and must be a positive number' });
        }

        const sanitizedName = String(name).trim();
        const sanitizedGoalType = String(goalType).trim();
        const sanitizedStartDate = startDate ? String(startDate).trim() : null;
         const sanitizedEndDate = endDate ? String(endDate).trim() : null;


        const newGoal = {
             id: String(Date.now()),
            name: sanitizedName,
            goalType: sanitizedGoalType,
            targetValue: targetValue,
            startDate: sanitizedStartDate,
            endDate: sanitizedEndDate,
            progress: {
                currentValue: 0,
                updatedAt: new Date().toISOString()
            }
        };

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }


        user.goals = user.goals || [];
        user.goals.push(newGoal);


        await user.save();

        res.status(201).json({ message: 'Goal created successfully', goal: newGoal });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Server error during goal creation' });
    }
};



const updateGoal = async (req, res) => {
    try {
         const { goalId } = req.params;
         const userId = req.user.id;
        const { name, goalType, targetValue, startDate, endDate } = req.body;


        if (!goalId) {
           return res.status(400).json({ message: 'Goal ID is required' });
         }
         if (!name || typeof name !== 'string' || name.trim().length < 1) {
            return res.status(400).json({ message: 'Goal name is required and must be at least 1 character long' });
        }

        if (!goalType || typeof goalType !== 'string' || goalType.trim().length < 1) {
             return res.status(400).json({ message: 'Goal type is required and must be at least 1 character long' });
        }

        if (!targetValue || typeof targetValue !== 'number' || targetValue <= 0) {
           return res.status(400).json({ message: 'Target value is required and must be a positive number' });
       }
        const sanitizedName = String(name).trim();
        const sanitizedGoalType = String(goalType).trim();
         const sanitizedStartDate = startDate ? String(startDate).trim() : null;
        const sanitizedEndDate = endDate ? String(endDate).trim() : null;


        const user = await User.findById(userId);
         if(!user){
            return res.status(404).json({message: 'User not found'});
        }

         const goalIndex = user.goals ? user.goals.findIndex(goal => goal.id === goalId) : -1;

        if (goalIndex === -1) {
            return res.status(404).json({ message: 'Goal not found' });
        }


        user.goals[goalIndex] = {
            ...user.goals[goalIndex],
            name: sanitizedName,
            goalType: sanitizedGoalType,
            targetValue: targetValue,
            startDate: sanitizedStartDate,
            endDate: sanitizedEndDate,
        };

        await user.save();

        res.status(200).json({ message: 'Goal updated successfully', goal: user.goals[goalIndex] });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error during goal update' });
    }
};

const deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const userId = req.user.id;

         if (!goalId) {
           return res.status(400).json({ message: 'Goal ID is required' });
         }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

         const goalIndex = user.goals ? user.goals.findIndex(goal => goal.id === goalId) : -1;


        if (goalIndex === -1) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        user.goals.splice(goalIndex, 1);
        await user.save();


        res.status(204).json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error during goal deletion' });
    }
};


export { createGoal, updateGoal, deleteGoal };