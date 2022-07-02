const { AuthenticationError } = require('apollo-server-express');
// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
       

        return userData;
      }
    },
    Mutations: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
  
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
        return { token, user };
      },
      async saveBook(parent, args, context) {
        console.log(user);
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: args } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        } catch (err) {
          console.log(err);
          throw new AuthenticationError('Incorrect input');
        }
      },
      async deleteBook(parent, args, context) {
        console.log(user);
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: args.bookId } } },
            { new: true, runValidators: true }
          );
          if (!updatedUser) {
            throw new AuthenticationError('Could not find user');
          }
          return updatedUser;
        } catch (err) {
          console.log(err);
          throw new AuthenticationError('Incorrect input');
        }
      },
    }
  


  
};


module.exports = resolvers; 