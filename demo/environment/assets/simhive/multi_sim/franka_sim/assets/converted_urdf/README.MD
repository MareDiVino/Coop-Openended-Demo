Example convert mjcf to urdf to use within CBFpy

First, we need the mjcf file. That is the xml file that has everything needed to run the mujoco environment.
For our environments, it is created dynamically after all the `<include>` tags have been expanded.
For the Robotiq environments, comment the line `os.remove(processed_model_path)` in the `__init__` function of the corresponding
entry point class.
For example, comment [this line](https://github.com/arayabrain/robohive-multi/blob/e4ab9dde20c6987dbb2c71ab6cfde83aed51e877/robohive_multi/envs/single_arms/franka_ee_pose_v0.py#L71) and run

```python
import gym
import robohive_multi
env = gym.make("FrankaGelloRobotiqHighRes-v0")
```
A new file `franka_gello_robotiq_highres_v0_processed.xml` is created, and that is the mjcf file we were looking for.

In such file, there will be many bodies and assets we might not need, so we ***manually*** have to remove what is not needed. 

**Note**: If you keep the gripper, set the respective joints as `fixed`.

After doing that, we can finally obtain the urdf. Assuming you are in this folder, you can do
```
pip install mjcf_urdf_simple_converter
mkdir franka_gello_robotiq_highres_v0
cd ../../../../../envs/single_arms/franka/assets/ # needed to correctly load meshes
```
Then open a python shell and 
```python
from mjcf_urdf_simple_converter import convert
convert("franka_gello_robotiq_highres_v0_processed.xml",
        "../../../../simhive/multi_sim/franka_sim/assets/converted_urdf/franka_gello_robotiq_highres_v0/franka_gello_robotiq_highres_v0.urdf")
```

Finally, don't forget to uncomment [this line](https://github.com/arayabrain/robohive-multi/blob/e4ab9dde20c6987dbb2c71ab6cfde83aed51e877/robohive_multi/envs/single_arms/franka_ee_pose_v0.py#L71)