/**
 * 第六节 加载器
 */
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { useCallback, useEffect, useRef } from 'react'
import './index.scss'

const Page = () => {
    const Body = useRef()
    const Scene = useRef(new THREE.Scene()).current // 场景
    const Camera = useRef(new THREE.PerspectiveCamera()).current // 透视相机
    const Render = useRef(new THREE.WebGLRenderer({ antialias: true })).current  // 渲染器
    const Floor = useRef() // 地板
    const Meshs = useRef([]).current
    const Lights = useRef([]).current
    const IsDown = useRef(false)
    const PI = useRef(100)
    const R = useRef(90)
    const id = useRef(null)

    const loaderFbx = useCallback(() => {
        const loader = new FBXLoader() 
        loader.setPath('/static/obj/')
        loader.load('gtx.fbx', (obj) => {
            obj.position.set(0, 0, 0)
            
            obj.scale.set(0.1, 0.1, 0.1)
            Scene.add(obj)
        })
    }, [])

    /** 初始化灯光 */
    const createLight = useCallback(() => {
        // 太阳光
        const dirLight = new THREE.DirectionalLight('#ffffff', 0.7)
        dirLight.position.set(0, 200, 0)
        dirLight.castShadow = true
        dirLight.shadow.camera.top = -10
        dirLight.shadow.camera.bottom = 10
        dirLight.shadow.camera.right = -10
        dirLight.shadow.camera.left = 10
        dirLight.shadow.mapSize.width = 2000
        dirLight.shadow.mapSize.height = 2000
        // 环境光
        const ambLight = new THREE.AmbientLight('#ffffff', 0.5)

        // 点光源
        // const point = new THREE.PointLight('#ffffff', 2, 8)
        // point.position.set(0, 5, 0)
        
        Scene.add(dirLight, ambLight)
        Lights.push(dirLight, ambLight)
    }, [])


    /** 创建地板 */
    const createFloor = useCallback(() => {
        const lambert = new THREE.MeshLambertMaterial({ color: '#ffffff' })
        const plane = new THREE.PlaneGeometry(300, 300)
        const mesh = new THREE.Mesh(plane, lambert)
        mesh.receiveShadow = true
        mesh.position.set(0, 0, 0)
        mesh.rotation.x = -90 / 180 * Math.PI
        Scene.add(mesh)
        Floor.current = mesh
    }, [])

    const down = useCallback(() => IsDown.current = true, [])
    const up = useCallback(() => IsDown.current = false, [])
    const move = useCallback((event) => {
        if (IsDown.current === false) return
        R.current -= event.movementX * 0.5
        const x = PI.current * Math.cos(R.current / 180 * Math.PI)
        const y = Camera.position.y + event.movementY * 0.1
        const z = PI.current * Math.sin(R.current / 180 * Math.PI)

        Camera.position.set(x, y, z)
        Camera.lookAt(0, 0, 0)
    }, [])

    const wheel = useCallback((event) => {
        if (event.deltaY > 0) PI.current += 1
        else PI.current -= 1

        const x = PI.current * Math.cos(R.current / 180 * Math.PI)
        const y = Camera.position.y
        const z = PI.current * Math.sin(R.current / 180 * Math.PI)

        Camera.position.set(x, y, z)
        Camera.lookAt(0, 0, 0)
    }, [])

    const init = useCallback(() => {
        Render.setSize(Body.current.offsetWidth, Body.current.offsetHeight)
        Render.shadowMap.enabled = true
        // 设置相机参数
        Camera.aspect = Body.current.offsetWidth / Body.current.offsetHeight
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 3, PI.current)
        Camera.lookAt(0, 0, 0)
        Camera.updateProjectionMatrix()
    }, [Render, Body])

    // 渲染画面
    const renderScene = useCallback(() => {
        Render.render(Scene, Camera)
        id.current = window.requestAnimationFrame(() => renderScene())
    }, [Render, Meshs])

    const setView = () => {
        Render.setSize(document.body.clientWidth, document.body.clientHeight)
        Camera.aspect = Body.current.offsetWidth / Body.current.offsetHeight
        Camera.updateProjectionMatrix()
    }

    useEffect(() => {
        Body.current.append(Render.domElement)
        init()
        createLight()
        createFloor()
        loaderFbx()
        renderScene()
        document.addEventListener('resize', setView)
        // 销毁钩子
        return () => {
            document.removeEventListener('resize', setView)
            cancelAnimationFrame(id.current)
            Meshs.forEach(item => {
                Scene.remove(item)
                item.geometry.dispose()
                item.material.dispose()
            })
            Floor.current && Scene.remove(Floor.current)
            Lights.forEach(item => Scene.remove(item))
            Render.dispose()
            Scene.dispose()
        }
    }, [])

    return (
        <div className="page" ref={Body} onMouseDown={down} onMouseUp={up} onMouseMove={move} onWheel={wheel} ></div>
    )
}

export default Page
